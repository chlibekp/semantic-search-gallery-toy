import {
  AutoProcessor,
  CLIPVisionModelWithProjection,
  PreTrainedModel,
  Processor,
  RawImage,
} from "@xenova/transformers";

class VisionModel {
  visionModel: PreTrainedModel | null;
  processor: Processor | null;
  isLoaded: boolean;
  constructor() {
    this.visionModel = null;
    this.processor = null;
    this.isLoaded = false;
  }

  /**
   * Preloads model and tokenizer
   */
  async load() {
    // Preload the model and tokenizer
    this.visionModel = await CLIPVisionModelWithProjection.from_pretrained(
      "Xenova/clip-vit-base-patch32",
    );
    this.processor = await AutoProcessor.from_pretrained(
      "Xenova/clip-vit-base-patch32",
    );
    this.isLoaded = true;
  }

  /**
   * Return vector representation of the query for semantic search
   */
  async getVectors(image: RawImage): Promise<number[]> {
    // Make sure vision model and tokenizer are loaded
    if (!this.processor || !this.visionModel) {
      throw new Error("Model or processor not loaded");
    }

    // Tokenize the image
    const inputs = await this.processor(image);

    // Get the vision embeddings
    const { image_embeds } = await this.visionModel(inputs);

    return Array.from(image_embeds.data);
  }
}

export default VisionModel;
