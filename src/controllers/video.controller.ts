import { videoQueue } from "@/queues";
import { VideoJobNames } from "@/types/video-job";
import asyncHandler from "@/utils/asyncHandler";
import HttpStatusCode from "@/utils/httpStatus";
import { Request, Response } from "express";

class VideoController {
  constructor() {}

  public mergeVideoWithCaption = asyncHandler(
    async (req: Request, res: Response) => {
      const { job_id, video_id, language, style, animations, maxLength } =
        req.body;

      await videoQueue.add(
        "burn" as VideoJobNames,
        {
          video_id,
          style,
          language,
          animations,
          max_length: maxLength,
        },
        {
          jobId: job_id,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      res.status(HttpStatusCode.ACCEPTED).json({
        message: "Video processing job accepted successfully",
        data: {
          job_id,
        },
      });
    },
  );
}

export default VideoController;
