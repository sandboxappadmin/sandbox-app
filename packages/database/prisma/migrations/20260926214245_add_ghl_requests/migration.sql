-- CreateEnum
CREATE TYPE "GhlRequestStatus" AS ENUM ('PENDING_PAYMENT', 'PAID');

-- CreateTable
CREATE TABLE "GhlRequest" (
    "id" TEXT NOT NULL,
    "status" "GhlRequestStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "businessName" TEXT NOT NULL,
    "notes" TEXT,
    "paymongoCheckoutSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "accountId" TEXT NOT NULL,

    CONSTRAINT "GhlRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GhlRequest" ADD CONSTRAINT "GhlRequest_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
