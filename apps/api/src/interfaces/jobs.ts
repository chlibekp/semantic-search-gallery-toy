interface ProcessImagesJob {
    id: string;
    imageUrl: string;
    embeddings?: number[];
    description?: string;
}

export type { ProcessImagesJob };