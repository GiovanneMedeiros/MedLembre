-- CreateEnum
CREATE TYPE "MedicationStatus" AS ENUM ('ATIVO', 'PAUSADO');

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dosagem" TEXT NOT NULL,
    "observacao" TEXT,
    "horarios" TEXT[],
    "diasSemana" INTEGER[],
    "dataInicio" DATE NOT NULL,
    "dataFim" DATE,
    "status" "MedicationStatus" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dose_records" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dose_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medications_userId_idx" ON "medications"("userId");

-- CreateIndex
CREATE INDEX "dose_records_userId_scheduledFor_idx" ON "dose_records"("userId", "scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "dose_records_medicationId_scheduledFor_key" ON "dose_records"("medicationId", "scheduledFor");

-- AddForeignKey
ALTER TABLE "dose_records" ADD CONSTRAINT "dose_records_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
