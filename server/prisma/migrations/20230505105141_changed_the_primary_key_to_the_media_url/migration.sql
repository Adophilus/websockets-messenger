/*
  Warnings:

  - The primary key for the `Media` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Media` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Media" DROP CONSTRAINT "Media_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Media_pkey" PRIMARY KEY ("url");

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "mediaIds" SET DATA TYPE TEXT[];
