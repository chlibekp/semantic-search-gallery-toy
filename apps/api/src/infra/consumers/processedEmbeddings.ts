
import logger from "@/src/util/winston";
import redis from "../redis";
import { ProcessImagesJob } from "@/src/interfaces/jobs";

async function processedEmbeddings() {
    while (true) {
        let job: ProcessImagesJob | null = null;
        try {
            // Move the job to processing queue
            const jobString = await redis.brpoplpush(
                "process-images:queue",
                "process-images:processing",
                5
            );
            if (!jobString) continue;

            job = JSON.parse(jobString) as ProcessImagesJob;


            // If the job was successful, remove it from the processing queue
            await redis.lrem("process-images:processing", 1, jobString)
        } catch (err) {
            logger.warn("Error processing job: ", err);

            if(job) {
                const jobString = JSON.stringify(job);  

                // If the job fails to process, move the job back to queue and remove it from processing queue
                await redis.lrem("process-images:processing", 1, jobString);
                await redis.lpush("process-images:queue", jobString);
                logger.warn("Failed job put back to queue: ", job);
            }
        }
    }
}

export { processedEmbeddings };