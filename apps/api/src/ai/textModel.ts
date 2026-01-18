import { AutoTokenizer, CLIPTextModelWithProjection, PreTrainedModel, PreTrainedTokenizer } from "@xenova/transformers";
import logger from "../util/winston";

class TextModel {
    private textModel: PreTrainedModel | null;
    private tokenizer: PreTrainedTokenizer | null;
    public isLoaded: boolean;
    constructor() {
        this.textModel = null;
        this.tokenizer = null;
        this.isLoaded = false;
    }

    /**
     * Preloads model and tokenizer
     */
    async load() {
        if(this.isLoaded) return;
        logger.info("Loading models...")
        // Preload the model and tokenizer
        this.textModel = await CLIPTextModelWithProjection.from_pretrained("Xenova/clip-vit-base-patch32");
        this.tokenizer = await AutoTokenizer.from_pretrained("Xenova/clip-vit-base-patch32");  
        logger.info("Models loaded")
        this.isLoaded = true;
    }

    /**
     * Return vector representation of the query for semantic search
     */
    async getVectors(query: string): Promise<number[]> {
        // Make sure text model and tokenizer are loaded
        if(!this.tokenizer) {
            throw new Error("Tokenizer not loaded");
        }
        if(!this.textModel) {
            throw new Error("Text model not loaded");
        }
        // Tokenize the query
        const inputs = this.tokenizer([query], { padding: true, truncation: true })
        
        // Get the text embeddings
        const { text_embeds } = await this.textModel(inputs);

        // Return the first embedding, we do not support batch queries
        return text_embeds.data;
    }
}

export default TextModel;