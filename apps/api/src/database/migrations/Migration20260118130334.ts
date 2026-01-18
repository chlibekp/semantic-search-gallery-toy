import { Migration } from '@mikro-orm/migrations';

export class Migration20260118130334 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "images" add column "ai_description" varchar(255) null, add column "ai_embedding" text[] null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "images" drop column "ai_description", drop column "ai_embedding";`);
  }

}
