import IORedis from "ioredis";
import dotenv from "dotenv";
import { REDIS_URL } from "@/utils/env";
dotenv.config();

const isProd = (process.env.NODE_ENV || "").trim().toLowerCase() === "production";

const redisConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  ...(isProd && { tls: {} }),
  retryStrategy(times: number) {
    return Math.min(times * 50, 2000);
  },
});

redisConnection.on("connect", () => console.log("[Redis] Connected"));
redisConnection.on("error", (err) =>
  console.error("[Redis] Error:", err.message),
);

export default redisConnection;
