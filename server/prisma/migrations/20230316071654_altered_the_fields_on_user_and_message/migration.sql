-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "senderUsername" TEXT NOT NULL,
    "recipientUsername" TEXT NOT NULL,
    "has_read" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Message_senderUsername_fkey" FOREIGN KEY ("senderUsername") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_recipientUsername_fkey" FOREIGN KEY ("recipientUsername") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("created_at", "has_read", "id", "message", "recipientUsername", "senderUsername", "updated_at") SELECT "created_at", "has_read", "id", "message", "recipientUsername", "senderUsername", "updated_at" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
