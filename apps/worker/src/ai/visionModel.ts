import { AutoTokenizer, CLIPTextModelWithProjection, CLIPVisionModelWithProjection, PreTrainedModel, PreTrainedTokenizer, RawImage } from "@xenova/transformers";

class VisionModel {
    visionModel: PreTrainedModel | null;
    tokenizer: PreTrainedTokenizer | null;
    constructor() {
        this.visionModel = null;
        this.tokenizer = null;
    }

    /**
     * Preloads model and tokenizer
     */
    async load() {
        // Preload the model and tokenizer
        this.visionModel = await CLIPVisionModelWithProjection.from_pretrained("Xenova/clip-vit-base-patch32");
        this.tokenizer = await AutoTokenizer.from_pretrained("Xenova/clip-vit-base-patch32");  
    }

    /**
     * Return vector representation of the query for semantic search
     */
    async getVectors(image: RawImage): Promise<number[]> {
        // Make sure vision model and tokenizer are loaded
        if(!this.tokenizer) {
            throw new Error("Tokenizer not loaded");
        }
        if(!this.visionModel) {
            throw new Error("Vision model not loaded");
        }
        // Tokenize the image
        const inputs = this.tokenizer(image);
        
        // Get the vision embeddings
        const { image_embeds } = await this.visionModel(inputs);

        // Return the first embedding, we do not support batch queries
        return image_embeds.data[0];
    }
}

export default VisionModel;
