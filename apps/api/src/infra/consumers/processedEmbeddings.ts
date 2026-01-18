import orm from "@/src/database/pg";
import { ProcessImagesJob } from "@/src/interfaces/jobs";
import { tryCatch } from '@/src/util/trycatch';
import { Images } from "@/src/database/entities/images";
import logger from "@/src/util/winston";

/**
 * Updates the image with generated embeddings
 */
async function processedEmbeddings(job: ProcessImagesJob) {
    logger.info("Starting to process image", { job: job.id });

    const em = orm.em.fork();

    // get an existing image from db
    const { data: image, error } = await tryCatch(em.findOne(Images, { id: job.id }) as Promise<Images | null>);

    // Make sure we got the image
    if(error) {
        throw new Error(`Error finding image id: ${job.id} ${error.message}`);
    }

    if(!image) {
        throw new Error(`Image not found id: ${job.id}`);
    }

    // Update embeddings
    image.aiEmbedding = job.aiEmbedding;

    // Update the image
    const { error: persistError } = await tryCatch(em.persist(image).flush());

    // Make sure we updated the image
    if(persistError) {
        throw new Error(`Error updating image id: ${job.id} ${persistError.message}`);
    }
}

export { processedEmbeddings };