/*
  Warnings:

  - You are about to drop the column `socket_id` on the `OnlineUser` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `OnlineUser` table. All the data in the column will be lost.
  - Added the required column `sid` to the `OnlineUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `OnlineUser` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OnlineUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "OnlineUser_username_fkey" FOREIGN KEY ("username") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OnlineUser" ("created_at", "id", "updated_at") SELECT "created_at", "id", "updated_at" FROM "OnlineUser";
DROP TABLE "OnlineUser";
ALTER TABLE "new_OnlineUser" RENAME TO "OnlineUser";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
