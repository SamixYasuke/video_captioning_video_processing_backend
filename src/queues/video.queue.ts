import { Queue } from "bullmq";
import redisConnection from "@/config/redis";
import { TranscodeJobData, VideoJobNames } from "@/types/video-job";

const videoQueue = new Queue<TranscodeJobData, void, VideoJobNames>("video-processing", {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: { count: 50 },
    removeOnFail: { age: 60 * 60 * 24 }, // 24 hours
  },
});

export default videoQueue;
