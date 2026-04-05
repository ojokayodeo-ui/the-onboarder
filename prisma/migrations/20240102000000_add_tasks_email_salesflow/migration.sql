-- Add salesflowDealId to Client
ALTER TABLE "Client" ADD COLUMN "salesflowDealId" TEXT;

-- Task table
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedTo" TEXT NOT NULL DEFAULT 'AGENCY',
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- EmailLog table
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "Task_clientId_idx" ON "Task"("clientId");
CREATE INDEX "Task_assignedTo_idx" ON "Task"("assignedTo");
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "EmailLog_clientId_idx" ON "EmailLog"("clientId");

-- Foreign keys
ALTER TABLE "Task" ADD CONSTRAINT "Task_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
