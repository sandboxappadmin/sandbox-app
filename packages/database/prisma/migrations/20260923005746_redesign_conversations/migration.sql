/*
  Warnings:

  - You are about to drop the column `channel` on the `Conversation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contactId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `body` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `channel` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'FAILED');

-- DropIndex
DROP INDEX "Conversation_contactId_idx";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "channel";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "channel" "MessageChannel" NOT NULL,
ADD COLUMN     "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
ADD COLUMN     "subject" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_contactId_key" ON "Conversation"("contactId");
