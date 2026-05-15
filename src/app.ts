import Express, { Application, Request, Response } from "express";
import errorHandler from "./errors/error";
import { ApiError } from "./errors/apierror";
import { getMemory, getUptime } from "./utils/helper";
import { ENV } from "./utils/env";
import initializeDatabaseAndServer from "./server";
import router from "./routes";
import * as os from "os";

const app: Application = Express();

app.use(Express.json({ limit: "50mb" }));

app.use(Express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  res.status(200).json({
    message: "🎥 Video Captioning Video Processing Service is running",
    timestamp: new Date().toISOString(),
    environment: ENV,
    version: "1.0.0",
    documentation: {
      swagger: `${baseUrl}/api-docs`,
    },
    backgroundJobs: {
      dashboard: `${baseUrl}/admin/queues`,
      workers: ["transcribe", "burn"],
    },
    system: {
      uptime: getUptime(),
      memory: getMemory(),
      platform: process.platform,
      architecture: os.arch(),
      cpu: os.cpus()[0].model,
    },
  });
});

app.all("*", (req, _res, next) => {
  next(
    new ApiError(
      `Can't find ${req.originalUrl} on ${req.method} request on this server!`,
      404,
    ),
  );
});

app.use(errorHandler);

initializeDatabaseAndServer(app);
