import { Router } from "express";
import videoRouter from "./video.route";

const router = Router();

router.use("/video", videoRouter);

export default router;
