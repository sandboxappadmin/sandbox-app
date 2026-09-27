/*
  Warnings:

  - You are about to drop the column `paymongoCheckoutSessionId` on the `GhlRequest` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubscriptionPlanType" AS ENUM ('SANDBOX_ONLY', 'SANDBOX_PLUS_GHL');

-- AlterTable
ALTER TABLE "GhlRequest" DROP COLUMN "paymongoCheckoutSessionId";

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "pendingCheckoutPlanType" "SubscriptionPlanType",
ADD COLUMN     "pendingPlanType" "SubscriptionPlanType",
ADD COLUMN     "planType" "SubscriptionPlanType" NOT NULL DEFAULT 'SANDBOX_ONLY';
