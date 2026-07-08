import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "footer_quick_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer_important_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "home_services_section_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"link" varchar,
  	"icon_id" integer,
  	"video_url" varchar
  );
  
  ALTER TABLE "home" ALTER COLUMN "services_section_section_title" SET DEFAULT 'Services We Offer';
  ALTER TABLE "home" ALTER COLUMN "services_section_short_description" SET DEFAULT 'From consultation to installation, we handle all your interior design needs, whether it''s your home, office, or a large-scale project.';
  ALTER TABLE "home" ALTER COLUMN "our_process_section_title" SET DEFAULT 'Our Process';
  ALTER TABLE "home" ALTER COLUMN "our_process_short_description" SET DEFAULT 'Follow our proven 5-step journey that transforms your vision into extraordinary reality';
  ALTER TABLE "home" ALTER COLUMN "client_stories_section_title" SET DEFAULT 'Client Stories';
  ALTER TABLE "home" ALTER COLUMN "client_stories_short_description" SET DEFAULT 'We create spaces that inspire and reflect your unique lifestyle';
  ALTER TABLE "footer" ADD COLUMN "headline" varchar DEFAULT 'Let''s Work Together and
  Create Something Extraordinary!';
  ALTER TABLE "footer" ADD COLUMN "quick_links_title" varchar DEFAULT 'Quick Links';
  ALTER TABLE "footer" ADD COLUMN "important_links_title" varchar DEFAULT 'Important Links';
  ALTER TABLE "footer" ADD COLUMN "contact_title" varchar DEFAULT 'Contact Us';
  ALTER TABLE "footer" ADD COLUMN "service_areas_title" varchar DEFAULT 'Service Areas';
  ALTER TABLE "footer" ADD COLUMN "copyright_text" varchar;
  ALTER TABLE "home_our_process_steps" ADD COLUMN "description" varchar;
  ALTER TABLE "home_our_process_steps" ADD COLUMN "color" varchar;
  ALTER TABLE "home" ADD COLUMN "blog_section_section_label" varchar DEFAULT 'BLOG';
  ALTER TABLE "home" ADD COLUMN "blog_section_section_title" varchar DEFAULT 'Latest Stories';
  ALTER TABLE "home" ADD COLUMN "blog_section_view_all_label" varchar DEFAULT 'View All Blogs';
  ALTER TABLE "home" ADD COLUMN "blog_section_view_all_url" varchar DEFAULT '/blog';
  ALTER TABLE "home" ADD COLUMN "cta_section_title" varchar DEFAULT 'Ready to Transform Your Space?';
  ALTER TABLE "home" ADD COLUMN "cta_section_highlight_word" varchar DEFAULT 'Transform';
  ALTER TABLE "home" ADD COLUMN "cta_section_description" varchar DEFAULT 'Whether you''re renovating, building from scratch, or simply looking to refresh your space, our team is ready to bring your vision to life.';
  ALTER TABLE "home" ADD COLUMN "cta_section_primary_button_label" varchar DEFAULT 'Book an Appointment';
  ALTER TABLE "home" ADD COLUMN "cta_section_primary_button_url" varchar DEFAULT '/book-appointment';
  ALTER TABLE "home" ADD COLUMN "cta_section_secondary_button_label" varchar DEFAULT 'Contact Us';
  ALTER TABLE "home" ADD COLUMN "cta_section_secondary_button_url" varchar DEFAULT '/contact';
  ALTER TABLE "footer_quick_links_links" ADD CONSTRAINT "footer_quick_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_important_links_links" ADD CONSTRAINT "footer_important_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_services_section_cards" ADD CONSTRAINT "home_services_section_cards_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_services_section_cards" ADD CONSTRAINT "home_services_section_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "footer_quick_links_links_order_idx" ON "footer_quick_links_links" USING btree ("_order");
  CREATE INDEX "footer_quick_links_links_parent_id_idx" ON "footer_quick_links_links" USING btree ("_parent_id");
  CREATE INDEX "footer_important_links_links_order_idx" ON "footer_important_links_links" USING btree ("_order");
  CREATE INDEX "footer_important_links_links_parent_id_idx" ON "footer_important_links_links" USING btree ("_parent_id");
  CREATE INDEX "home_services_section_cards_order_idx" ON "home_services_section_cards" USING btree ("_order");
  CREATE INDEX "home_services_section_cards_parent_id_idx" ON "home_services_section_cards" USING btree ("_parent_id");
  CREATE INDEX "home_services_section_cards_icon_idx" ON "home_services_section_cards" USING btree ("icon_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer_quick_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_important_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_services_section_cards" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "footer_quick_links_links" CASCADE;
  DROP TABLE "footer_important_links_links" CASCADE;
  DROP TABLE "home_services_section_cards" CASCADE;
  ALTER TABLE "home" ALTER COLUMN "services_section_section_title" DROP DEFAULT;
  ALTER TABLE "home" ALTER COLUMN "services_section_short_description" DROP DEFAULT;
  ALTER TABLE "home" ALTER COLUMN "our_process_section_title" DROP DEFAULT;
  ALTER TABLE "home" ALTER COLUMN "our_process_short_description" DROP DEFAULT;
  ALTER TABLE "home" ALTER COLUMN "client_stories_section_title" DROP DEFAULT;
  ALTER TABLE "home" ALTER COLUMN "client_stories_short_description" DROP DEFAULT;
  ALTER TABLE "footer" DROP COLUMN "headline";
  ALTER TABLE "footer" DROP COLUMN "quick_links_title";
  ALTER TABLE "footer" DROP COLUMN "important_links_title";
  ALTER TABLE "footer" DROP COLUMN "contact_title";
  ALTER TABLE "footer" DROP COLUMN "service_areas_title";
  ALTER TABLE "footer" DROP COLUMN "copyright_text";
  ALTER TABLE "home_our_process_steps" DROP COLUMN "description";
  ALTER TABLE "home_our_process_steps" DROP COLUMN "color";
  ALTER TABLE "home" DROP COLUMN "blog_section_section_label";
  ALTER TABLE "home" DROP COLUMN "blog_section_section_title";
  ALTER TABLE "home" DROP COLUMN "blog_section_view_all_label";
  ALTER TABLE "home" DROP COLUMN "blog_section_view_all_url";
  ALTER TABLE "home" DROP COLUMN "cta_section_title";
  ALTER TABLE "home" DROP COLUMN "cta_section_highlight_word";
  ALTER TABLE "home" DROP COLUMN "cta_section_description";
  ALTER TABLE "home" DROP COLUMN "cta_section_primary_button_label";
  ALTER TABLE "home" DROP COLUMN "cta_section_primary_button_url";
  ALTER TABLE "home" DROP COLUMN "cta_section_secondary_button_label";
  ALTER TABLE "home" DROP COLUMN "cta_section_secondary_button_url";`)
}
