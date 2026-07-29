-- CreateTable
CREATE TABLE "Comic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "series" TEXT,
    "number" TEXT,
    "writer" TEXT,
    "penciller" TEXT,
    "year" TEXT,
    "summary" TEXT,
    "fileName" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "errorMessage" TEXT,
    "pageCount" INTEGER NOT NULL DEFAULT 0,
    "archiveKey" TEXT NOT NULL,
    "coverKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "comicId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "imageKey" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    CONSTRAINT "Page_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ComicTag" (
    "comicId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("comicId", "tagId"),
    CONSTRAINT "ComicTag_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ComicTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReadingProgress" (
    "comicId" TEXT NOT NULL PRIMARY KEY,
    "currentPage" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReadingProgress_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Comic_status_idx" ON "Comic"("status");

-- CreateIndex
CREATE INDEX "Comic_series_idx" ON "Comic"("series");

-- CreateIndex
CREATE UNIQUE INDEX "Page_comicId_index_key" ON "Page"("comicId", "index");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_label_key" ON "Tag"("label");
