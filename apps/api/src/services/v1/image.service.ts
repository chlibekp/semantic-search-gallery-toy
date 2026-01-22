import { Images } from "@/src/database/entities/images";
import orm from "@/src/database/pg";
import { redisConsumer } from "@/src/infra/redis";
import S3Storage from "@/src/util/s3";
import { tryCatch } from "@/src/util/trycatch";
import logger from "@/src/util/winston";
import sharp from "sharp";
import { textModel } from "@/src/app";

import { v4 as uuidv4 } from "uuid";

// Type for the files parameter
type files = Express.Multer.File[] | undefined;

class ImageService {
  private chunkArray<T>(arr: T[], chunkSize: number) {
    const output = [];
    // Process images in groups of chunkSize
    for (let i = 0; i < arr.length; i += chunkSize) {
      output.push(arr.slice(i, i + chunkSize));
    }
    return output;
  }

  async upload(files: files) {
    const s3 = new S3Storage();

    // Make sure we got files
    if (!files || files?.length == 0) {
      throw new Error("No file uploaded");
    }

    /**
            Upload all files to s3 and return images that should be inserted to database
        */
    const { data: allFiles, error: uploadError } = await tryCatch(
      Promise.allSettled(
        files.map(async (file): Promise<Images> => {
          const id = uuidv4();

          // Convert the image to jpeg and get the buffer
          const { data: jpegBuffer, error: conversionError } = await tryCatch(
            sharp(file.buffer).toFormat("jpeg").toBuffer(),
          );

          // Handle failed conversion
          if (conversionError) {
            throw conversionError;
          }

          // Upload to s3
          const { error, data } = await tryCatch(
            s3.upload(jpegBuffer, `${id}.jpeg`, "image/jpeg"),
          );

          // Handle failed upload to s3
          if (error) {
            throw new Error(error.message);
          }

          return {
            imageUrl: data.url,
            id,
          };
        }),
      ),
    );

    // Handle failed upload to s3
    if (uploadError) {
      throw new Error(uploadError.message);
    }

    let filesToInsert = [];
    const failedFiles = [];

    for (const file of allFiles) {
      // Categorize results based on status
      if (file.status === "fulfilled") {
        filesToInsert.push(file.value);
      } else {
        failedFiles.push(file.reason);
      }
    }

    // Make sure we got files to insert
    if (!filesToInsert || filesToInsert?.length == 0) {
      throw new Error("No file uploaded to database");
    }

    const em = orm.em.fork();

    // Insert all uploaded images to database
    await em.insertMany(Images, filesToInsert);
    await em.flush();

    // Try to push all uploaded images to redis queue for asynchronous processing
    for (const file of filesToInsert) {
      // Push to process-images:queue queue
      const { error } = await tryCatch(
        redisConsumer.rpush(
          "process-images:queue",
          JSON.stringify({
            id: file.id,
            imageUrl: file.imageUrl,
          }),
        ),
      );

      // If we fail to add the file to queue
      if (error) {
        logger.error(`Failed to add file to queue: ${error.message}`);

        // Remove the file from the list to be inserted to db
        filesToInsert = filesToInsert.filter((f) => f.id !== file.id);

        // Delete the file from s3 as well
        await s3.delete(file.id);
      }
    }

    return {
      errors: failedFiles?.length || 0,
      files: filesToInsert,
    };
  }

  /**
   * Get all images from the database
   */
  async getImages(query?: string): Promise<Images[][]> {
    const em = orm.em.fork();

    // If we got a query and the model is ready, do semantic search
    if (query && textModel.isLoaded) {
      // get vector from the query
      const { data: queryVectors, error: vectorError } = await tryCatch(
        textModel.getVectors(query),
      );

      // Handle failed vectorization
      if (vectorError) {
        throw vectorError;
      }

      // Format the vector for db
      const validQuery = `[${queryVectors.join(",")}]`;

      // Do a semantic search based on the vector on database with top_k of 20
      const results = await em.getConnection().execute(
        `
          SELECT 
            id, 
            image_url AS "imageUrl",
            1 - (ai_embedding <=> ?::vector) AS similarity
          FROM images
          WHERE ai_embedding IS NOT NULL
          ORDER BY ai_embedding <=> ?::vector
          LIMIT 20;
        `,
        [validQuery, validQuery],
      ) as Images[];

      // Chunk the results to 5 items per row
      return this.chunkArray<Images>(results, 5);
    }

    // If we haven't got a query

    // Get all images from the database
    const images = await em.findAll(Images, {
      fields: ["id", "imageUrl"],
    });

    // Chunk them to 5 items per row
    const output = this.chunkArray<Images>(images, 5);

    return output;
  }
}

export default ImageService;
