import { type Application } from "express";
import connectDB from "./config/mongodb";
import { getLocalIp } from "./utils/helper";
import { ENV, PORT } from "./utils/env";
import "./workers/video.worker";

const initializeDatabaseAndServer = async (app: Application): Promise<void> => {
  try {
    await connectDB();
    console.info("Database has connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      const localIp = getLocalIp();
      console.info(`Server is running on port ${PORT} in ${ENV} mode`);
      console.log(`Local access: http://localhost:${PORT}`);
      console.log(`Network access: http://${localIp}:${PORT}`);
    });
  } catch (error) {
    console.error(`Error connecting to the server: ${error}`);
    process.exit(1);
  }
};

export default initializeDatabaseAndServer;
