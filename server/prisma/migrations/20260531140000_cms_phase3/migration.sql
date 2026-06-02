-- AlterTable Admin
ALTER TABLE "Admin" ADD COLUMN "email" TEXT;
ALTER TABLE "Admin" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'super_admin';

-- AlterTable Article
ALTER TABLE "Article" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable Event
ALTER TABLE "Event" ADD COLUMN "deletedAt" DATETIME;

-- CreateTable ContentRevision
CREATE TABLE "ContentRevision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "snapshot" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ContentRevision_entityType_entityId_idx" ON "ContentRevision"("entityType", "entityId");

-- CreateTable AuditLog
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT,
    "username" TEXT NOT NULL DEFAULT 'admin',
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
