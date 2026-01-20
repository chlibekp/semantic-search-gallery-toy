import { describe, expect, it } from "vitest";
import S3Storage from "../src/util/s3";
import fs from "fs";
import path from "path";

describe("S3Storage", () => {
  const s3 = new S3Storage();
  let uploadedUrl: string;
  const testKey = `test-upload-${Date.now()}.jpeg`;

  it("should upload an image to S3", async () => {
    // Load the test image
    const imagePath = path.resolve(__dirname, "../../../static/cat.jpeg");
    const imageBuffer = fs.readFileSync(imagePath);

    // Upload the test image to s3
    const response = await s3.upload(imageBuffer, testKey, "image/jpeg");

    // Get the image and set it globally
    uploadedUrl = response.url;

    expect(uploadedUrl).not.toBeNull();
    expect(uploadedUrl).toContain(testKey);
    expect(response.response.$metadata.httpStatusCode).toBe(200);
  });

  it("should delete an image from S3", async () => {
    // Delete the image we just uploaded
    const response = await s3.delete(testKey);

    expect(response.$metadata.httpStatusCode).toBe(204);
  });
});
