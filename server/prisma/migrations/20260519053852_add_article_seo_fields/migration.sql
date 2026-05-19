-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "authorAvatar" TEXT NOT NULL,
    "publishedAt" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Article" ("authorAvatar", "authorName", "authorRole", "category", "content", "createdAt", "excerpt", "id", "isPublished", "publishedAt", "slug", "thumbnail", "time", "title", "updatedAt") SELECT "authorAvatar", "authorName", "authorRole", "category", "content", "createdAt", "excerpt", "id", "isPublished", "publishedAt", "slug", "thumbnail", "time", "title", "updatedAt" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
