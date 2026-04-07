ALTER TABLE "EmailLog" ADD COLUMN "sequenceStep" TEXT;
CREATE INDEX "EmailLog_sequenceStep_idx" ON "EmailLog"("sequenceStep");
