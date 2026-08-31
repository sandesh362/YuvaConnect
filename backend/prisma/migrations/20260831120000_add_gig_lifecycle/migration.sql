CREATE TYPE "GigStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'PAID', 'CLOSED');
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'SHORTLISTED', 'SELECTED', 'REJECTED');

CREATE TABLE "Gig" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skillsRequired" TEXT[] NOT NULL,
    "budget" DECIMAL(12,2) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "status" "GigStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Gig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "proposal" TEXT NOT NULL,
    "relevantExperience" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RevisionRequest" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RevisionRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Application_gigId_studentId_key" ON "Application"("gigId", "studentId");
CREATE INDEX "Gig_businessId_idx" ON "Gig"("businessId");
CREATE INDEX "Gig_status_idx" ON "Gig"("status");
CREATE INDEX "Application_studentId_idx" ON "Application"("studentId");
CREATE INDEX "Deliverable_gigId_idx" ON "Deliverable"("gigId");
CREATE INDEX "RevisionRequest_gigId_idx" ON "RevisionRequest"("gigId");

ALTER TABLE "Gig" ADD CONSTRAINT "Gig_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RevisionRequest" ADD CONSTRAINT "RevisionRequest_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
