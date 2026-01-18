import { Images } from "@/src/database/entities/images";
import orm from "@/src/database/pg";
import redis from "@/src/infra/redis";
import S3Storage from "@/src/util/s3";
import { tryCatch } from "@/src/util/trycatch";

import { v4 as uuidv4 } from "uuid";

// Type for the files parameter
type files = Express.Multer.File[] | undefined;

class ImageService {
    async upload(files: files) {
        const s3 = new S3Storage();

        // Make sure we got files
        if(!files || files?.length == 0) {
            throw new Error("No file uploaded");
        }

        /**
          Upload all files to s3 and return images that should be inserted to database
         */
        const { data: allFiles } = await tryCatch(Promise.allSettled(files.map(async (file): Promise<Images> => {
            const id = uuidv4();
            const { error, data } = await tryCatch(s3.upload(file.buffer, id, file.mimetype));

            if(error) {
                throw new Error(error.message);
            }

            return {
                imageUrl: data.url,
                id
            };
        })));

        // Get all files that were successfully uploaded to s3
        let filesToInsert = allFiles?.filter(file => file.status === "fulfilled").map(file => file.value);

        // Get all files that failed to upload to s3
        const failedFiles = allFiles?.filter(file => file.status === "rejected").map(file => file.reason);

        // Make sure we got files to insert
        if(!filesToInsert || filesToInsert?.length == 0) {
            throw new Error("No file uploaded to database");
        }

        // Try to push all uploaded images to redis queue for asynchronous processing
        for(const file of filesToInsert) {
            const { error } = await tryCatch(redis.rpush("process-images:queue", JSON.stringify({
                id: file.id,
                imageUrl: file.imageUrl
            })))

            // If we fail to add the file to queue
            if(error) {
                // Remove the file from the list to be inserted to db
                filesToInsert = filesToInsert.filter(f => f.id !== file.id);

                // Delete the file from s3 as well
                await s3.delete(file.id)
            }
        }

        const em = orm.em.fork();

        // Insert all uploaded images to database
        await em.insertMany(Images, filesToInsert);
        await em.flush();

        return {
            success: filesToInsert,
            errors: failedFiles?.length || 0
        };
    }

    /**
     * Get all images from the database
     */
    async getAllImages(): Promise<Images[]> {
        const em = orm.em.fork();
        const images = await em.findAll(Images, {});
        return images;
    }
}

export default ImageService;
