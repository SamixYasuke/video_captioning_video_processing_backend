import fs from "fs";
import FfmpegService from "./ffmpeg.service";
import S3Service from "./s3.service";
import { CustomSubStyle } from "@/types/ffmpeg";
import { CaptionAnimations } from "@/types/animations";
import { randomUUID } from "crypto";
import CaptionAnimator from "./caption-animator.service";
import { Video } from "@/models";
import axios from "axios";

class VideoService {
  public readonly ffmpegService: FfmpegService;
  public readonly s3Service: S3Service;
  public readonly captionAnimator: CaptionAnimator;

  constructor() {
    this.ffmpegService = new FfmpegService();
    this.s3Service = new S3Service();
    this.captionAnimator = new CaptionAnimator();
  }

  public executeBurnJob = async (
    videoId: string,
    language?: string,
    style: CustomSubStyle = {
      fontName: "Arial",
      fontSize: 42,
      primaryColor: "&H00FFFFFF", // White
      outlineColor: "&H00000000", // Black outline
      backColor: "&H00000000",
      borderStyle: 1, // Outline + shadow (no box)
      outline: 2,
      shadow: 0,
      bold: 0,
      italic: 0,
      alignment: 2, // Bottom center
      marginV: 40,
      marginL: 0,
      marginR: 0,
      spacing: 0,
    },
    animations: CaptionAnimations = {},
    maxLength: number = 0,
  ) => {
    const video = await Video.findById(videoId).lean();

    if (!video) {
      throw new Error(`Video not found: ${videoId}`);
    }

    const originalCaption = video.captions?.find((c) => c.is_original);

    if (!originalCaption) {
      throw new Error(`No captions available for video: ${videoId}`);
    }

    // Determine which caption to use
    let targetCaption = originalCaption;

    if (language && language !== originalCaption.language_code) {
      const translation = video.captions?.find(
        (t) => t.language_code === language && !t.is_original,
      );
      if (!translation) {
        throw new Error(
          `Translation for ${language} not found on video: ${videoId}`,
        );
      }
      targetCaption = translation;
    }

    const targetCaptionResponse = targetCaption.caption_response;
    const targetLanguage = targetCaption.language_code;

    let s3Key: string | undefined;

    try {
      const { video_key, meta_data } = video;
      const { file_name } = meta_data;

      const videoUrl = await this.s3Service.getSignedDownloadUrl(
        video_key.uploaded,
        undefined,
        6 * 3600,
      );

      let result: any;

      if (!targetCaptionResponse) {
        throw new Error(
          "Transcript response missing — cannot burn captions. Please re-transcribe.",
        );
      }

      const modeToUse =
        animations &&
        (animations.entrance || animations.exit || animations.mode)
          ? animations.mode || "karaoke"
          : "none";

      const metadata = await this.ffmpegService.getVideoMetadata(videoUrl);
      const assLines = this.captionAnimator.generate(
        targetCaptionResponse,
        animations?.entrance,
        animations?.exit,
        metadata.width || 1280,
        metadata.height || 720,
        style.alignment || 2,
        style.marginV ?? 40,
        style.marginL ?? 0,
        style.marginR ?? 0,
        maxLength,
        modeToUse,
        animations?.highlightColor,
        style.borderStyle,
        style.primaryColor,
      );

      result = await this.ffmpegService.mergeVideoWithAssContent(
        videoUrl,
        assLines,
        style,
      );

      const { tempOutputPath, height, width, bitrate, codec_name, duration } =
        result;

      s3Key = `${this.s3Service.processedFolder}/${file_name.replace(/\.[^/.]+$/, "")}-${randomUUID()}.mp4`;

      let videoStream: fs.ReadStream | null = null;
      try {
        videoStream = fs.createReadStream(tempOutputPath);
        await this.s3Service.uploadStream(s3Key, videoStream, "video/mp4");
      } finally {
        videoStream?.destroy();
        if (fs.existsSync(tempOutputPath)) {
          fs.unlinkSync(tempOutputPath);
        }
      }
      const url = await this.s3Service.getSignedDownloadUrl(s3Key);

      const outputs = video.outputs || [];
      const outputIdx = outputs.findIndex(
        (o) => o.language_code === targetLanguage,
      );

      const newOutput = {
        language_code: targetLanguage,
        video_key: s3Key,
        status: "completed" as any,
        created_at: new Date(),
      };

      if (outputIdx >= 0) {
        outputs[outputIdx] = newOutput;
      } else {
        outputs.push(newOutput);
      }

      await Video.updateOne(
        { _id: videoId },
        {
          $set: {
            "video_key.processed": s3Key,
            outputs,
            "meta_data.duration": duration,
          },
        },
      );

      return {
        url,
        language: targetLanguage,
        height,
        width,
        bitrate,
        codec_name,
        duration,
      };
    } catch (error) {
      if (s3Key) {
        await this.s3Service.deleteObject(s3Key);
      }

      throw error;
    }
  };

  public updateVideoStatus = async (
    videoId: string,
    status: string,
    retryCount = 0,
  ) => {
    try {
      await axios.post(
        `${process.env.API_BASE_URL}/api/v1/video/webhook/burned`,
        {
          video_id: videoId,
          status,
        },
      );
    } catch (error: any) {
      console.error(
        `Webhook failed for ${videoId} (attempt ${retryCount + 1}):`,
        error?.message || error,
      );
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(
          () => this.updateVideoStatus(videoId, status, retryCount + 1),
          delay,
        );
      }
    }
  };
}

export default VideoService;
