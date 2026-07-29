-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "email" TEXT,
ADD COLUMN     "pendingPeriodicidade" "BillingPeriod",
ADD COLUMN     "pendingPlano" "Plano";

-- CreateIndex
CREATE INDEX "subscriptions_email_idx" ON "subscriptions"("email");
