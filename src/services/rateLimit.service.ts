import rateLimit, { ipKeyGenerator } from "express-rate-limit";

class RateLimit {
  public limiter: ReturnType<typeof rateLimit>;

  constructor(maxRateLimitRequestPerMin?: number, rateLimitMessage?: string) {
    this.limiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: maxRateLimitRequestPerMin || 20, // Block after 20 requests
      message: {
        message:
          rateLimitMessage || "Too many requests, please try again later.",
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: any) => {
        return req.user?.user_id ? req.user.user_id : ipKeyGenerator(req);
      },
    });
  }
}

export default RateLimit;
