import { Worker, Job } from "bullmq";
import redisConnection from "@/config/redis";
import { VideoService } from "@/services";
import { TranscodeJobData } from "@/types/video-job";
import fs from "fs";
import path from "path";

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception in worker:", err);
  setTimeout(() => process.exit(1), 500);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection in worker:", reason);
  setTimeout(() => process.exit(1), 500);
});

const videoService = new VideoService();

function cleanTempDirs(): void {
  const dirs = ["../../temp/output", "../../temp/captions"].map((d) =>
    path.resolve(__dirname, d),
  );
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      try {
        fs.unlinkSync(path.join(dir, file));
      } catch {}
    }
  }
  console.log("Temp dirs cleaned on startup");
}

cleanTempDirs();

const videoWorker = new Worker<TranscodeJobData>(
  "video-processing",
  async (job: Job<TranscodeJobData>) => {
    const { userId, video_id, max_length, style, language, animations } =
      job.data;
    switch (job.name) {
      case "burn":
        await videoService.executeBurnJob(
          video_id!,
          language,
          style,
          animations,
          max_length,
        );
        break;
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  },
  {
    connection: redisConnection as any,
    concurrency: 1,
    maxStalledCount: 2,
    removeOnComplete: {
      count: 100,
      age: 60 * 60 * 24,
    },
    removeOnFail: {
      age: 60 * 60 * 24,
    },
  },
);

videoWorker.on("error", (err) => {
  console.error("Video worker error:", err);
});

videoWorker.on("failed", async (job, err) => {
  if (job && job.name === "burn" && job.data?.video_id) {
    console.log(`Job ${job.id} failed with error: ${err.message}`);
    await videoService.updateVideoStatus(job.data.video_id, "failed");
  }
});

videoWorker.on("completed", async (job) => {
  if (job && job.name === "burn" && job.data?.video_id) {
    console.log(`Job ${job.id} completed successfully`);
    await videoService.updateVideoStatus(job.data.video_id, "burned");
  }
});

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  if (videoWorker) {
    await videoWorker.close();
  }
  process.exit(0);
};

process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.once("SIGINT", () => gracefulShutdown("SIGINT"));

console.log("Video worker started");

export default videoWorker;
