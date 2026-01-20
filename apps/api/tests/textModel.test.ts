import TextModel from "../src/ai/textModel";
import { describe, expect, it } from "vitest";

const textModel = new TextModel();

describe("TextModel", () => {
    it("Should return an error when model is not initialized", async () => {
        await expect(textModel.getVectors("test")).rejects.toThrow("Model or processor not loaded");
    })

    it("Should load model and tokenizer", async () => {
        await textModel.load();
        expect(textModel.isLoaded).toBe(true);
    }, 60000)

    it("Should return vectors when the model is loaded", async () => {
        const query = "a cat sitting on a couch";
        
        const vectors = await textModel.getVectors(query);
        // CLIP text embeddings are 512 dimensions
        expect(vectors.length).toBe(512);
    })
})
