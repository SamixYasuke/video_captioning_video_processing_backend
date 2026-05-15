import { Router } from "express";
import VideoController from "@/controllers/video.controller";
import { mergeVideoAndCaptionValidator } from "@/validators/video.validator";
import { validate } from "@/middlewares";

const videoRouter = Router();
const videoController = new VideoController();

videoRouter.post(
  "/merge",
  mergeVideoAndCaptionValidator,
  validate,
  videoController.mergeVideoWithCaption,
);

export default videoRouter;
