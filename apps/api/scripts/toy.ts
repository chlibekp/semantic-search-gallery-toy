import { AutoProcessor, CLIPVisionModelWithProjection, CLIPTextModelWithProjection, RawImage, DataArray, AutoTokenizer } from "@xenova/transformers";
import sharp from "sharp"
import fs from "fs";

// Load CLIP processor and models
const processor = await AutoProcessor.from_pretrained("Xenova/clip-vit-base-patch32");
const tokenizer = await AutoTokenizer.from_pretrained("Xenova/clip-vit-base-patch32");
const visionModel = await CLIPVisionModelWithProjection.from_pretrained("Xenova/clip-vit-base-patch32");
const textModel = await CLIPTextModelWithProjection.from_pretrained("Xenova/clip-vit-base-patch32");

const getRawImage = async (path: string) => {
    const imageBuffer = fs.readFileSync(path);
    const { data, info } = await sharp(imageBuffer)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    
    return new RawImage(data, info.width, info.height, info.channels);
}

interface Embedding {
    title: string;
    embedding: DataArray;
}

const embeddings = await Promise.all(fs.readdirSync("images").map(async file => {
    const path = `images/${file}`;
    const rawImage = await getRawImage(path);
    const imageInputs = await processor(rawImage);
    const { image_embeds: embedding } = await visionModel(imageInputs);

    return {
        title: file.split(".")[0],
        embedding: embedding.data
    }
})) as Embedding[];

// do a cosine similarity between the two embeddings
const cosineSimilarity = (a: DataArray, b: DataArray): number => {
    const dotProduct = Array.from(a).reduce((acc, val, i) => acc + val * b[i], 0);
    const magnitudeA = Math.sqrt(Array.from(a).reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(Array.from(b).reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

const search = async (query: string) => {
    // Compute text embedding
    const inputs = await tokenizer([query], { padding: true, truncation: true });
    const { text_embeds } = await textModel(inputs);
    
    // text_embeds is a Tensor, accessing .data gives the Float32Array (or similar)
    const textEmbedding = text_embeds.data;

    const results = embeddings.map(e => ({
        title: e.title,
        score: cosineSimilarity(e.embedding, textEmbedding)
    })).sort((a, b) => b.score - a.score);

    return results[0];
}

const dog = await search("4 wheels");

console.log(dog)