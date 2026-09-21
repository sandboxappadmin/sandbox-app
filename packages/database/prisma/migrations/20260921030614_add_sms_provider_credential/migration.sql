-- CreateTable
CREATE TABLE "SmsProviderCredential" (
    "id" TEXT NOT NULL,
    "encryptedApiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "SmsProviderCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SmsProviderCredential_accountId_key" ON "SmsProviderCredential"("accountId");

-- AddForeignKey
ALTER TABLE "SmsProviderCredential" ADD CONSTRAINT "SmsProviderCredential_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
