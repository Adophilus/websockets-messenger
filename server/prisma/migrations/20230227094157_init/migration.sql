-- CreateTable
CREATE TABLE "messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sender" TEXT NOT NULL,
    "recepient" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "has_read" BOOLEAN NOT NULL
);
