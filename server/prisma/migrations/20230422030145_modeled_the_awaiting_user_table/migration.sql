-- CreateTable
CREATE TABLE "AwaitingUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "awaitedUserUsername" TEXT NOT NULL,
    "waitingUserUsername" TEXT NOT NULL,
    CONSTRAINT "AwaitingUser_awaitedUserUsername_fkey" FOREIGN KEY ("awaitedUserUsername") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AwaitingUser_waitingUserUsername_fkey" FOREIGN KEY ("waitingUserUsername") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
);
