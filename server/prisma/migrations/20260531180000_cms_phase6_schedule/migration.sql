-- AlterTable Article: scheduled publish
ALTER TABLE "Article" ADD COLUMN "publishAt" DATETIME;
ALTER TABLE "Article" ADD COLUMN "unpublishAt" DATETIME;

-- AlterTable Event: scheduled publish
ALTER TABLE "Event" ADD COLUMN "publishAt" DATETIME;
ALTER TABLE "Event" ADD COLUMN "unpublishAt" DATETIME;
