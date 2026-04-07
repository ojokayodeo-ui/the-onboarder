-- Message table
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'OUTBOUND',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "aiAssisted" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Message_clientId_idx" ON "Message"("clientId");
CREATE INDEX "Message_direction_idx" ON "Message"("direction");

ALTER TABLE "Message" ADD CONSTRAINT "Message_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
