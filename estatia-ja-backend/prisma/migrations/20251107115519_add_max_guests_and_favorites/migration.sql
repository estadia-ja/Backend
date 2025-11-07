-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "maxGuests" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "favorite_properties" (
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_properties_pkey" PRIMARY KEY ("userId","propertyId")
);

-- AddForeignKey
ALTER TABLE "favorite_properties" ADD CONSTRAINT "favorite_properties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_properties" ADD CONSTRAINT "favorite_properties_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
