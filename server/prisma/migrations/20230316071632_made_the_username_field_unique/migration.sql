/*
  Warnings:

  - You are about to drop the column `image` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `recepient` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `sender` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `recipientUsername` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderUsername` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "senderUsername" TEXT NOT NULL,
    "recipientUsername" TEXT NOT NULL,
    "has_read" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Message" ("created_at", "has_read", "id", "message", "updated_at") SELECT "created_at", "has_read", "id", "message", "updated_at" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
