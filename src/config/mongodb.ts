import { ENV, MONGODB_DEV_URI, MONGODB_PROD_URI } from "@/utils/env";
import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const nodeEnv = ENV;
    const isDevelopment = nodeEnv === "development";
    const uri = isDevelopment ? MONGODB_DEV_URI : MONGODB_PROD_URI;

    await mongoose.connect(uri);
    console.log(`MongoDB connected successfully (${nodeEnv} mode)`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
