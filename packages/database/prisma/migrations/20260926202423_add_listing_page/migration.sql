-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "imageUrls" JSONB;

-- CreateTable
CREATE TABLE "ListingPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "listingIds" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nicheInstallId" TEXT NOT NULL,

    CONSTRAINT "ListingPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingPage_slug_key" ON "ListingPage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ListingPage_nicheInstallId_key" ON "ListingPage"("nicheInstallId");

-- AddForeignKey
ALTER TABLE "ListingPage" ADD CONSTRAINT "ListingPage_nicheInstallId_fkey" FOREIGN KEY ("nicheInstallId") REFERENCES "NicheInstall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
