import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "header_menu_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar,
  	"has_mega_menu" boolean DEFAULT false
  );
  
  CREATE TABLE "header_mega_menu_sections_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "header_mega_menu_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"color" varchar,
  	"background_color" varchar,
  	"view_all_url" varchar
  );
  
  ALTER TABLE "header" ADD COLUMN "mega_menu_help_text" varchar DEFAULT 'Need help choosing?';
  ALTER TABLE "header" ADD COLUMN "mega_menu_help_link_text" varchar DEFAULT 'Contact our experts';
  ALTER TABLE "header" ADD COLUMN "mega_menu_button_label" varchar DEFAULT 'Get Consultation';
  ALTER TABLE "header" ADD COLUMN "mega_menu_button_url" varchar DEFAULT '/contact';
  ALTER TABLE "header_menu_items" ADD CONSTRAINT "header_menu_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_mega_menu_sections_links" ADD CONSTRAINT "header_mega_menu_sections_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_mega_menu_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_mega_menu_sections" ADD CONSTRAINT "header_mega_menu_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_menu_items_order_idx" ON "header_menu_items" USING btree ("_order");
  CREATE INDEX "header_menu_items_parent_id_idx" ON "header_menu_items" USING btree ("_parent_id");
  CREATE INDEX "header_mega_menu_sections_links_order_idx" ON "header_mega_menu_sections_links" USING btree ("_order");
  CREATE INDEX "header_mega_menu_sections_links_parent_id_idx" ON "header_mega_menu_sections_links" USING btree ("_parent_id");
  CREATE INDEX "header_mega_menu_sections_order_idx" ON "header_mega_menu_sections" USING btree ("_order");
  CREATE INDEX "header_mega_menu_sections_parent_id_idx" ON "header_mega_menu_sections" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "header_menu_items" CASCADE;
  DROP TABLE "header_mega_menu_sections_links" CASCADE;
  DROP TABLE "header_mega_menu_sections" CASCADE;
  ALTER TABLE "header" DROP COLUMN "mega_menu_help_text";
  ALTER TABLE "header" DROP COLUMN "mega_menu_help_link_text";
  ALTER TABLE "header" DROP COLUMN "mega_menu_button_label";
  ALTER TABLE "header" DROP COLUMN "mega_menu_button_url";`)
}
