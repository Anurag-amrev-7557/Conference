-- AlterTable SiteContent: optimistic locking
ALTER TABLE "SiteContent" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
