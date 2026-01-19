import VisionModel from "../src/ai/visionModel";
import { RawImage } from "@xenova/transformers";
import { describe, expect, it } from "vitest";
import fs from "fs";

const visionModel = new VisionModel();

describe("VisionModel", () => {
    it("Model and processor should be null when not loaded", () => {
        expect(visionModel.visionModel).toBe(null);
        expect(visionModel.processor).toBe(null);
    })

    it("Should return an error when model is not initialized", () => {
        const rawImage = new RawImage(Buffer.from(""), 1, 1, 1);
        visionModel.getVectors(rawImage).catch((error) => {
            expect(error.message).toBe("Model or processor not loaded");
        });
    })

    it("Should load model and processor", async () => {
        await visionModel.load();
        expect(visionModel.isLoaded).toBe(true);
    }, 60000)

    it("Should return vectors when the model is loaded", async () => {
        const rawBuffer = fs.readFileSync("tests/cat.jpg");
        const rawImage = new RawImage(rawBuffer, 1, 1, 1);
        
        const vectors = await visionModel.getVectors(rawImage);
        expect(vectors.length).toBe(512);
    })
})