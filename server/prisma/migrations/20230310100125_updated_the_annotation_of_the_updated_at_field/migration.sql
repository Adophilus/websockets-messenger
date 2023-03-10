-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sender" TEXT NOT NULL,
    "recepient" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "has_read" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_messages" ("created_at", "has_read", "id", "image", "message", "recepient", "sender", "updated_at") SELECT "created_at", "has_read", "id", "image", "message", "recepient", "sender", "updated_at" FROM "messages";
DROP TABLE "messages";
ALTER TABLE "new_messages" RENAME TO "messages";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
