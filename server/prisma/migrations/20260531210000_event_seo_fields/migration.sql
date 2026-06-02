-- Event SEO fields (schema had these; only Article received them in 20260519053852)
ALTER TABLE "Event" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Event" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "Event" ADD COLUMN "ogImage" TEXT;
ALTER TABLE "Event" ADD COLUMN "noindex" BOOLEAN NOT NULL DEFAULT false;
