-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnlineUser" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnlineUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AwaitingUser" (
    "id" SERIAL NOT NULL,
    "awaitedUserUsername" TEXT NOT NULL,
    "waitingUserUsername" TEXT NOT NULL,
    "sid" TEXT NOT NULL,

    CONSTRAINT "AwaitingUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "senderUsername" TEXT NOT NULL,
    "recipientUsername" TEXT NOT NULL,
    "has_read" BOOLEAN NOT NULL,
    "media" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "OnlineUser" ADD CONSTRAINT "OnlineUser_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AwaitingUser" ADD CONSTRAINT "AwaitingUser_awaitedUserUsername_fkey" FOREIGN KEY ("awaitedUserUsername") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AwaitingUser" ADD CONSTRAINT "AwaitingUser_waitingUserUsername_fkey" FOREIGN KEY ("waitingUserUsername") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderUsername_fkey" FOREIGN KEY ("senderUsername") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientUsername_fkey" FOREIGN KEY ("recipientUsername") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
