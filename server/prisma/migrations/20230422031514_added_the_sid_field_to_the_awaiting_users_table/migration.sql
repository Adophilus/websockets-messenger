/*
  Warnings:

  - Added the required column `sid` to the `AwaitingUser` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AwaitingUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "awaitedUserUsername" TEXT NOT NULL,
    "waitingUserUsername" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    CONSTRAINT "AwaitingUser_awaitedUserUsername_fkey" FOREIGN KEY ("awaitedUserUsername") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AwaitingUser_waitingUserUsername_fkey" FOREIGN KEY ("waitingUserUsername") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AwaitingUser" ("awaitedUserUsername", "id", "waitingUserUsername") SELECT "awaitedUserUsername", "id", "waitingUserUsername" FROM "AwaitingUser";
DROP TABLE "AwaitingUser";
ALTER TABLE "new_AwaitingUser" RENAME TO "AwaitingUser";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
