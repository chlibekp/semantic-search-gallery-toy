interface ProcessImagesJob {
  id: string;
  imageUrl: string;
  aiEmbedding?: number[];
  aiDescription?: string;
  retries?: number;
}

export type { ProcessImagesJob };
