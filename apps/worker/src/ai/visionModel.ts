import { AutoProcessor, AutoTokenizer, CLIPTextModelWithProjection, CLIPVisionModelWithProjection, PreTrainedModel, PreTrainedTokenizer, Processor, RawImage } from "@xenova/transformers";

class VisionModel {
    visionModel: PreTrainedModel | null;
    processor: Processor | null;
    constructor() {
        this.visionModel = null;
        this.processor = null;
    }

    /**
     * Preloads model and tokenizer
     */
    async load() {
        // Preload the model and tokenizer
        this.visionModel = await CLIPVisionModelWithProjection.from_pretrained("Xenova/clip-vit-base-patch32");
        this.processor = await AutoProcessor.from_pretrained("Xenova/clip-vit-base-patch32");  
    }

    /**
     * Return vector representation of the query for semantic search
     */
    async getVectors(image: RawImage): Promise<number[]> {
        // Make sure vision model and tokenizer are loaded
        if(!this.processor) {
            throw new Error("Tokenizer not loaded");
        }
        if(!this.visionModel) {
            throw new Error("Vision model not loaded");
        }

        // Tokenize the image
        const inputs = await this.processor(image);
        
        // Get the vision embeddings
        const { image_embeds } = await this.visionModel(inputs);

        return Array.from(image_embeds.data);
    }
}

export default VisionModel;
