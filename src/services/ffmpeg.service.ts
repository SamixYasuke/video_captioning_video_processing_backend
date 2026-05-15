import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { spawn, ChildProcess } from "child_process";
import {
  ConvertSrtToAssResponse,
  CustomSubStyle,
  MergeVideoWithSrtStreamResponse,
  VideoMetadata,
} from "@/types/ffmpeg";
import { INSTALLED_FONTS } from "@/config/fonts";
import assHeader from "@/utils/assHeader";

const activeFfmpegProcesses = new Set<ChildProcess>();

export const killAllFfmpeg = () => {
  for (const proc of activeFfmpegProcesses) {
    if (!proc.killed) proc.kill("SIGKILL");
  }
};

process.on("exit", killAllFfmpeg);

class FfmpegService {
  private readonly InstalledFontNames = INSTALLED_FONTS;

  private readonly fontsDir;
  private readonly ffmpegPath: string;
  private readonly ffProbePath: string;

  constructor() {
    this.fontsDir = path.resolve(__dirname, "../assets/fonts");
    this.ffmpegPath = "ffmpeg";
    this.ffProbePath = "ffprobe";
  }

  private selectFontName = (
    family: string,
    isBold: number = 0,
    isItalic: number = 0,
  ): string => {
    const font = this.InstalledFontNames[family];
    if (!font) return family;

    if (isBold && isItalic && font.boldItalic) return font.boldItalic;
    if (isBold && font.bold) return font.bold;
    if (isItalic && font.italic) return font.italic;
    return font.regular || family;
  };

  private getFfmpegArgs = (
    videoUrl: string,
    escapedAssPath: string,
    escapedFontPath: string,
    bitrate: string | number,
    tempOutputPath: string,
  ): string[] => {
    return [
      "-threads", "1",
      "-reconnect", "1",
      "-reconnect_streamed", "1",
      "-reconnect_delay_max", "5",
      "-i", videoUrl,
      "-vf", `fps=30,subtitles='${escapedAssPath}':fontsdir='${escapedFontPath}'`,
      "-c:v", "libx264",
      "-b:v", `${bitrate}`,
      "-crf", "23",
      "-preset", "veryfast",
      "-pix_fmt", "yuv420p",
      "-profile:v", "main",
      "-level", "4.0",
      "-c:a", "aac",
      "-b:a", "128k",
      "-ac", "2",
      "-ar", "44100",
      "-f", "mp4",
      "-movflags", "+faststart",
      "-loglevel", "error",
      tempOutputPath,
    ];
  };

  public getVideoMetadata = async (
    videoUrl: string,
  ): Promise<VideoMetadata> => {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn(this.ffProbePath, [
        "-v",
        "error",
        "-analyzeduration",
        "4000000",
        "-probesize",
        "3000000",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height,bit_rate,codec_name:format=duration",
        "-of",
        "json",
        videoUrl,
      ]);

      const timeout = setTimeout(() => {
        if (!ffprobe.killed) {
          ffprobe.kill("SIGKILL");
          reject(new Error("FFprobe timeout after 30 seconds"));
        }
      }, 30000);

      const chunks: Buffer[] = [];
      const errorChunks: Buffer[] = [];
      ffprobe.stdout.on("data", (data) => chunks.push(data));
      ffprobe.stderr.on("data", (data) => {
        if (Buffer.concat(errorChunks).length < 5000) {
          errorChunks.push(data);
        }
      });

      activeFfmpegProcesses.add(ffprobe);

      ffprobe.on("close", (code) => {
        activeFfmpegProcesses.delete(ffprobe);
        clearTimeout(timeout);
        const output = Buffer.concat(chunks).toString();
        const errorOutput = Buffer.concat(errorChunks)
          .toString()
          .slice(0, 5000);

        if (code !== 0) {
          console.error("FFPROBE STDERR:", errorOutput);
          return reject(new Error(`FFprobe failed with code ${code}`));
        }

        try {
          const data = JSON.parse(output);
          if (!data.streams?.length) {
            return reject(new Error("No video streams found"));
          }
          const stream = data.streams[0];
          const rawBitRate = stream.bit_rate || data.format?.bit_rate;
          const safeBitRate =
            rawBitRate && rawBitRate !== "N/A" ? rawBitRate : "2000k";

          resolve({
            width: stream.width,
            height: stream.height,
            bitRate: safeBitRate,
            codecName: stream.codec_name,
            duration: parseFloat(data.format?.duration ?? stream.duration),
          });
        } catch (e) {
          reject(e);
        }
      });

      ffprobe.on("error", (err) => {
        activeFfmpegProcesses.delete(ffprobe);
        clearTimeout(timeout);
        reject(err);
      });
    });
  };

  public convertCaptionTextToSrt = (captions: string) => {
    const id = randomUUID();
    const tempDir = path.resolve(__dirname, "../../temp/captions");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const srtPath = path.join(tempDir, `temp_${id}.srt`);
    fs.writeFileSync(srtPath, captions);
    return { srtPath };
  };

  private convertSrtToAss = async (
    captions: string,
    videoUrl: string,
    customStyles: CustomSubStyle = {},
  ): Promise<ConvertSrtToAssResponse> => {
    const tempDir = path.resolve(__dirname, "../../temp/captions");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const id = randomUUID();
    const assPath = path.join(tempDir, `subs_${id}.ass`);

    const { width, height, bitRate, codecName, duration } =
      await this.getVideoMetadata(videoUrl);

    const fontNameToUse = this.selectFontName(
      customStyles.fontName || "Arial Black",
      customStyles.bold,
      customStyles.italic,
    );

    const header = assHeader(fontNameToUse, customStyles, width, height);

    const dialogueLines = await new Promise<string>((resolve, reject) => {
      const { srtPath } = this.convertCaptionTextToSrt(captions);
      const chunks: Buffer[] = [];
      const conv = spawn(this.ffmpegPath!, [
        "-i",
        srtPath,
        "-f",
        "ass",
        "pipe:1",
      ]);

      activeFfmpegProcesses.add(conv);

      const timeout = setTimeout(() => {
        if (!conv.killed) {
          conv.kill("SIGKILL");
          if (fs.existsSync(srtPath)) fs.unlinkSync(srtPath);
          reject(new Error("SRT to ASS conversion timeout after 30 seconds"));
        }
      }, 30000);

      conv.stdout.on("data", (data) => chunks.push(data));
      conv.stderr.on("data", () => {}); // Drain stderr

      conv.on("close", () => {
        activeFfmpegProcesses.delete(conv);
        clearTimeout(timeout);
        if (fs.existsSync(srtPath)) fs.unlinkSync(srtPath);

        const output = Buffer.concat(chunks).toString();
        const parts = output.split("[Events]");
        const rawEvents = parts[1]?.split("Text")[1]?.trim() || "";

        // Break string slice reference to allow 'output' to be GC'd
        let events = (" " + rawEvents).slice(1);

        if (events) {
          // FFmpeg's internal srt->ass converter often injects default tags like {\fs16}, {\fnArial}, {\b1}, or {\i0}.
          // We strip these out so our custom style header takes full control.
          events = events.replace(/\\[fs|fn|b|i][^\\}]+/g, "");
        }

        resolve(events);
      });

      conv.on("error", (err) => {
        activeFfmpegProcesses.delete(conv);
        clearTimeout(timeout);
        if (fs.existsSync(srtPath)) fs.unlinkSync(srtPath);
        reject(err);
      });
    });

    const writeStream = fs.createWriteStream(assPath);
    writeStream.write(header);
    writeStream.write(dialogueLines);
    writeStream.end();
    await new Promise<void>((resolve) =>
      writeStream.on("finish", () => resolve()),
    );

    return {
      assPath,
      width,
      height,
      bitrate: bitRate,
      codec_name: codecName,
      duration,
    };
  };

  public mergeVideoWithSrtStream = async (
    videoUrl: string,
    captions: string,
    customStyles: CustomSubStyle = {},
  ): Promise<MergeVideoWithSrtStreamResponse> => {
    const { assPath, height, width, bitrate, codec_name, duration } =
      await this.convertSrtToAss(captions, videoUrl, customStyles);

    const relativeAssPath = path
      .relative(process.cwd(), assPath)
      .replace(/\\/g, "/");
    const relativeFontsDir = path
      .relative(process.cwd(), this.fontsDir)
      .replace(/\\/g, "/");
    const escapedAssPath = relativeAssPath
      .replace(/'/g, "'\\''")
      .replace(/ /g, "\\ ");
    const escapedFontPath = relativeFontsDir
      .replace(/'/g, "'\\''")
      .replace(/ /g, "\\ ");

    const tempDir = path.resolve(__dirname, "../../temp/output");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const tempOutputPath = path.join(tempDir, `output_${randomUUID()}.mp4`);

    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn(this.ffmpegPath!, this.getFfmpegArgs(
        videoUrl,
        escapedAssPath,
        escapedFontPath,
        bitrate,
        tempOutputPath
      ));

      activeFfmpegProcesses.add(ffmpeg);

      const timeout = setTimeout(() => {
        if (!ffmpeg.killed) {
          ffmpeg.kill("SIGKILL");
          reject(new Error("FFmpeg merge timed out after 10 minutes"));
        }
      }, 600000); // 10 minutes

      // Drain stderr so the OS pipe buffer never fills (which would block ffmpeg).
      // With -loglevel error this only fires when something is actually wrong.
      ffmpeg.stderr.on("data", (data) => {
        console.error(`ffmpeg: ${data.toString().trim()}`);
      });

      ffmpeg.on("close", (code) => {
        activeFfmpegProcesses.delete(ffmpeg);
        clearTimeout(timeout);
        if (fs.existsSync(assPath)) fs.unlinkSync(assPath);

        if (code !== 0 && code !== null) {
          if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
          reject(new Error(`FFmpeg exited with error code ${code}`));
        } else {
          resolve();
        }
      });

      ffmpeg.on("error", (err) => {
        activeFfmpegProcesses.delete(ffmpeg);
        clearTimeout(timeout);
        console.error(`FFmpeg spawn error: ${err.message}`);
        reject(err);
      });
    });

    return {
      tempOutputPath,
      width,
      height,
      bitrate,
      codec_name,
      duration,
    };
  };

  public mergeVideoWithAssContent = async (
    videoUrl: string,
    assLines: Iterable<string>,
    customStyles: CustomSubStyle = {},
  ): Promise<MergeVideoWithSrtStreamResponse> => {
    const tempDir = path.resolve(__dirname, "../../temp/captions");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const { width, height, bitRate, codecName, duration } =
      await this.getVideoMetadata(videoUrl);

    const fontNameToUse = this.selectFontName(
      customStyles.fontName || "Arial Black",
      customStyles.bold,
      customStyles.italic,
    );

    const header = assHeader(fontNameToUse, customStyles, width, height);
    const id = randomUUID();
    const assPath = path.join(tempDir, `subs_${id}.ass`);

    const writeStream = fs.createWriteStream(assPath);
    writeStream.write(header);
    for (const line of assLines) {
      writeStream.write(line + "\n");
    }
    writeStream.end();

    await new Promise<void>((resolve) =>
      writeStream.on("finish", () => resolve()),
    );

    const relativeAssPath = path
      .relative(process.cwd(), assPath)
      .replace(/\\/g, "/");
    const relativeFontsDir = path
      .relative(process.cwd(), this.fontsDir)
      .replace(/\\/g, "/");

    const escapedAssPath = relativeAssPath
      .replace(/'/g, "'\\''")
      .replace(/ /g, "\\ ");
    const escapedFontPath = relativeFontsDir
      .replace(/'/g, "'\\''")
      .replace(/ /g, "\\ ");

    console.log(`FFmpeg ASS Stream Input URL: ${videoUrl}`);
    console.log(`FFmpeg ASS Path: ${escapedAssPath}`);

    const tempOutputDir = path.resolve(__dirname, "../../temp/output");
    if (!fs.existsSync(tempOutputDir))
      fs.mkdirSync(tempOutputDir, { recursive: true });
    const tempOutputPath = path.join(tempOutputDir, `output_${randomUUID()}.mp4`);

    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn(this.ffmpegPath!, this.getFfmpegArgs(
        videoUrl,
        escapedAssPath,
        escapedFontPath,
        bitRate,
        tempOutputPath
      ));

      activeFfmpegProcesses.add(ffmpeg);

      const timeout = setTimeout(() => {
        if (!ffmpeg.killed) {
          ffmpeg.kill("SIGKILL");
          reject(new Error("FFmpeg merge timed out after 10 minutes"));
        }
      }, 600000); // 10 minutes

      ffmpeg.stderr.on("data", (data) => {
        console.error(`ffmpeg: ${data.toString().trim()}`);
      });

      ffmpeg.on("close", (code) => {
        activeFfmpegProcesses.delete(ffmpeg);
        clearTimeout(timeout);
        if (fs.existsSync(assPath)) fs.unlinkSync(assPath);
        if (code !== 0 && code !== null) {
          if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
          reject(new Error(`FFmpeg exited with error code ${code}`));
        } else {
          resolve();
        }
      });

      ffmpeg.on("error", (err) => {
        activeFfmpegProcesses.delete(ffmpeg);
        clearTimeout(timeout);
        console.error(`FFmpeg spawn error: ${err.message}`);
        reject(err);
      });
    });

    return {
      tempOutputPath,
      width,
      height,
      bitrate: bitRate,
      codec_name: codecName,
      duration,
    };
  };
}

export default FfmpegService;
