-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('OPEN', 'PLANNED', 'IN_PROGRESS', 'SHIPPED', 'DECLINED');

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorUserId" TEXT NOT NULL,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuggestionVote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suggestionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SuggestionVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Suggestion_authorUserId_idx" ON "Suggestion"("authorUserId");

-- CreateIndex
CREATE UNIQUE INDEX "SuggestionVote_suggestionId_userId_key" ON "SuggestionVote"("suggestionId", "userId");

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestionVote" ADD CONSTRAINT "SuggestionVote_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "Suggestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuggestionVote" ADD CONSTRAINT "SuggestionVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
