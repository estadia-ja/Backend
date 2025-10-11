-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "paymentValue" DOUBLE PRECISION NOT NULL,
    "datePayment" TIMESTAMP(3) NOT NULL,
    "reserveId" TEXT NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_reserveId_key" ON "payments"("reserveId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "reserves"("id") ON DELETE CASCADE ON UPDATE CASCADE;
