-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_APPLICANT', 'APPLICATION_SELECTED', 'APPLICATION_REJECTED', 'GIG_STATUS_CHANGED', 'NEW_MESSAGE', 'PAYMENT_RELEASED');

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "totalRatings" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "BusinessProfile" ADD COLUMN "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "totalRatings" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "gigId" TEXT,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "relatedGigId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_gigId_createdAt_idx" ON "Message"("gigId", "createdAt");

-- CreateIndex
CREATE INDEX "Rating_toUserId_idx" ON "Rating"("toUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_gigId_fromUserId_key" ON "Rating"("gigId", "fromUserId");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_relatedGigId_fkey" FOREIGN KEY ("relatedGigId") REFERENCES "Gig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
