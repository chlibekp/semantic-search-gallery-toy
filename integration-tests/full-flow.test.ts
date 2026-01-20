import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const API_URL = process.env.API_URL || "http://localhost:3000/api/v1";

interface UploadResponse {
  errors: number;
  files: {
    id: string;
  }[];
}

interface Image {
  id: string;
}

describe("Full Flow Integration Test", () => {
  beforeAll(async () => {
    // Check if API is up
    try {
      const res = await fetch(`http://localhost:3000/api/health`);
      if (!res.ok) {
        console.warn(`API returned ${res.status} ${res.statusText}`);
      }
    } catch {
      console.warn(
        "API seems to be down. Make sure to run 'docker compose up' before running integration tests.",
      );
    }
  });

  it("should upload an image and retrieve it", async () => {
    // Load the test image
    const imagePath = path.resolve(__dirname, "../static/cat.jpeg");
    const buffer = readFileSync(imagePath);
    const blob = new Blob([buffer], { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("images", blob, "cat.jpeg");

    // Upload the test image
    console.log(`Uploading to ${API_URL}/upload...`);
    const uploadRes = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      // If connection refused, we skip or fail.
      // But for integration test, we expect env to be running.
      const text = await uploadRes.text().catch(() => "Unknown error");
      throw new Error(
        `Upload failed: ${uploadRes.status} ${uploadRes.statusText} - ${text}`,
      );
    }

    const uploadData = (await uploadRes.json()) as UploadResponse;
    expect(uploadData.files).toBeInstanceOf(Array);
    expect(uploadData.files.length).toBeGreaterThan(0);

    const imageId = uploadData?.files[0].id;
    expect(imageId).toBeDefined();
    console.log(`Uploaded image ID: ${imageId}`);

    const res = await fetch(`${API_URL}/images`);
    expect(res.ok).toBe(true);

    const images = (await res.json()) as Image[];

    expect(images.length).toBeGreaterThan(0);
    expect(Array.isArray(images)).toBe(true);
  });
});
