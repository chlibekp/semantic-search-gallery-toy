import { Migration } from "@mikro-orm/migrations";

export class Migration20260118163349 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`CREATE EXTENSION IF NOT EXISTS vector;`);
    this.addSql(
      `create table "images" ("id" uuid not null default gen_random_uuid(), "image_url" varchar(255) not null, "ai_description" varchar(255) null, "ai_embedding" vector(512) null, constraint "images_pkey" primary key ("id"));`,
    );
    this.addSql(`
      CREATE INDEX images_ai_embedding_idx
      ON "images"
      USING ivfflat ("ai_embedding" vector_cosine_ops)
      WITH (lists = 100);
    `);
    this.addSql(`ANALYZE "images";`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "images" cascade;`);
    this.addSql(`DROP INDEX IF EXISTS images_ai_embedding_idx;`);
  }
}
