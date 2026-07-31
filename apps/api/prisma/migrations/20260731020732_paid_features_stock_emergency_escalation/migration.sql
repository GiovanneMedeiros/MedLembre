-- AlterTable
ALTER TABLE "medications" ADD COLUMN     "estoqueAlertaLimiar" INTEGER DEFAULT 5,
ADD COLUMN     "estoqueQuantidade" INTEGER;

-- AlterTable
ALTER TABLE "reminder_logs" ADD COLUMN     "escalatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "emergency_contacts_userId_idx" ON "emergency_contacts"("userId");
