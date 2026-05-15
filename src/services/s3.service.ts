import s3Client, { BUCKET_NAME } from "@/config/s3";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import path from "path";
import { sanitizeFilename } from "@/utils/filename";
import { Readable } from "stream";

class S3Service {
  public readonly bucketName: string | undefined;
  public readonly uploadFolder: string = "videos/uploaded";
  public readonly processedFolder: string = "videos/processed";

  constructor() {
    this.bucketName = BUCKET_NAME;

    if (!this.bucketName) {
      throw new Error(
        "CLOUDFLARE_BUCKET_NAME is not defined in environment variables",
      );
    }
  }

  public async generateUploadPresignedUrl(
    fileName: string,
    mimeType: string,
  ): Promise<{ url: string; key: string }> {
    const cleanFileName = sanitizeFilename(fileName);
    const videoExtension = path.extname(fileName);
    const s3Key = `${this.uploadFolder}/${cleanFileName}-${randomUUID()}${videoExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: mimeType,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return { url, key: s3Key };
  }

  public async getSignedDownloadUrl(
    key: string,
    fileName?: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ...(fileName && {
        ResponseContentDisposition: `attachment; filename="${fileName}"`,
      }),
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  public async checkObjectExists(key: string): Promise<boolean> {
    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  public async uploadStream(
    key: string,
    body: Readable | Buffer | string,
    contentType: string = "video/mp4",
  ): Promise<void> {
    const upload = new Upload({
      client: s3Client,
      // Stream one 10 MB part at a time — prevents the entire video
      // from being buffered in Node's heap during multipart upload.
      queueSize: 1, // only 1 part in memory at a time
      partSize: 10 * 1024 * 1024, // 10 MB per part
      params: {
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      },
    });

    await upload.done();
  }

  public async deleteObject(key: string): Promise<void> {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }
}

export default S3Service;
