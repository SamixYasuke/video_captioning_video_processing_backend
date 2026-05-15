import dotenv from "dotenv";
dotenv.config();

const ENV = (process.env.NODE_ENV || "development").trim().toLowerCase();

if (!ENV || !(ENV === "production" || ENV === "development")) {
  throw new Error("NODE_ENV must be 'production' or 'development'");
}

const MONGODB_DEV_URI = process.env.MONGODB_DEV_URI;

if (ENV === "development" && !MONGODB_DEV_URI) {
  throw new Error("MONGODB_DEV_URI is not defined in .env file");
}

const MONGODB_PROD_URI = process.env.MONGODB_PROD_URI;

if (ENV === "production" && !MONGODB_PROD_URI) {
  throw new Error("MONGODB_PROD_URI is not defined in .env file");
}

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("REDIS_URL is not defined in .env file");
}

const PORT = Number(process.env.PORT);

if (!PORT) {
  throw new Error("PORT is not defined in .env file");
}

const CLOUDFLARE_ACCESS_KEY_ID = process.env.CLOUDFLARE_ACCESS_KEY_ID;

if (!CLOUDFLARE_ACCESS_KEY_ID) {
  throw new Error("CLOUDFLARE_ACCESS_KEY_ID is not defined in .env file");
}

const CLOUDFLARE_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;

if (!CLOUDFLARE_SECRET_ACCESS_KEY) {
  throw new Error("CLOUDFLARE_SECRET_ACCESS_KEY is not defined in .env file");
}

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

if (!CLOUDFLARE_ACCOUNT_ID) {
  throw new Error("CLOUDFLARE_ACCOUNT_ID is not defined in .env file");
}

const CLOUDFLARE_BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME;

if (!CLOUDFLARE_BUCKET_NAME) {
  throw new Error("CLOUDFLARE_BUCKET_NAME is not defined in .env file");
}

export {
  ENV,
  MONGODB_DEV_URI,
  MONGODB_PROD_URI,
  REDIS_URL,
  PORT,
  CLOUDFLARE_ACCESS_KEY_ID,
  CLOUDFLARE_SECRET_ACCESS_KEY,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_BUCKET_NAME,
};
