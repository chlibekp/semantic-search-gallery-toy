import { Migration } from '@mikro-orm/migrations';

export class Migration20260115151043 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "images" ("id" uuid not null default gen_random_uuid(), "image_url" varchar(255) not null, constraint "images_pkey" primary key ("id"));`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "images" cascade;`);
  }

}
