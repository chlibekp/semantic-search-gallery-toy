import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import env from "./env";

class S3Storage {
  private client: S3Client;

  constructor() {
    // Create a new S3 client
    this.client = new S3Client({
      endpoint: env.S3_URL,
      region: "auto",
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async delete(key: string) {
    // Create a new DELETE command
    const command = new DeleteObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
    });

    // Send the command to s3
    return await this.client.send(command);
  }

  async upload(file: Buffer, key: string, contentType: string) {
    // Create a new PUT command
    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    // Send the command to s3
    return {
      response: await this.client.send(command),
      url: `${env.S3_PUBLIC_URL}/${key}`,
    };
  }
}

export default S3Storage;
