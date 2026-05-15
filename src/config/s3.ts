import {
  CLOUDFLARE_ACCESS_KEY_ID,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_BUCKET_NAME,
  CLOUDFLARE_SECRET_ACCESS_KEY,
} from "@/utils/env";
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

if (
  !CLOUDFLARE_ACCESS_KEY_ID ||
  !CLOUDFLARE_SECRET_ACCESS_KEY ||
  !CLOUDFLARE_BUCKET_NAME
) {
  throw new Error("Missing Cloudflare credentials");
}

if (!CLOUDFLARE_ACCOUNT_ID) {
  throw new Error("Missing Cloudflare account ID");
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});

export { CLOUDFLARE_BUCKET_NAME as BUCKET_NAME };

export default s3Client;
