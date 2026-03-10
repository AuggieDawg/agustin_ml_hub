-- CreateEnum
CREATE TYPE "SecurityPropertyAccessRole" AS ENUM ('Viewer', 'Operator', 'Billing', 'Admin');

-- CreateEnum
CREATE TYPE "SecurityDeviceType" AS ENUM ('CAMERA', 'DOOR_SENSOR', 'WINDOW_SENSOR', 'MOTION_SENSOR', 'SMOKE_DETECTOR', 'CO_DETECTOR', 'LOCK', 'PANEL', 'SIREN', 'FLOOD_SENSOR', 'OTHER');

-- CreateEnum
CREATE TYPE "SecurityDeviceStatus" AS ENUM ('UNCONFIGURED', 'ONLINE', 'WARNING', 'OFFLINE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "CameraTransport" AS ENUM ('RTSP', 'HLS', 'WEBRTC', 'ONVIF', 'OTHER');

-- CreateEnum
CREATE TYPE "CameraStreamKind" AS ENUM ('LIVE', 'SUBSTREAM', 'RECORDING', 'SNAPSHOT');

-- CreateEnum
CREATE TYPE "CameraStreamStatus" AS ENUM ('UNCONFIGURED', 'CONNECTING', 'LIVE', 'DEGRADED', 'OFFLINE');

-- CreateEnum
CREATE TYPE "SecurityAlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SecurityAlertStatus" AS ENUM ('Open', 'Acknowledged', 'Resolved');

-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('MANUAL', 'DEVICE_HEARTBEAT', 'MOTION_DETECTED', 'DOOR_OPENED', 'DOOR_CLOSED', 'CAMERA_OFFLINE', 'CAMERA_RESTORED', 'SYSTEM_ARMED', 'SYSTEM_DISARMED', 'RECORDING_STARTED', 'RECORDING_STOPPED');

-- CreateEnum
CREATE TYPE "ServiceTicketPriority" AS ENUM ('Low', 'Medium', 'High', 'Urgent');

-- CreateEnum
CREATE TYPE "ServiceTicketStatus" AS ENUM ('Open', 'Scheduled', 'InProgress', 'Resolved', 'Closed');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('Draft', 'Open', 'Paid', 'Overdue', 'Void');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('Operations', 'Support', 'Commercial', 'Warranty', 'Other');

-- CreateTable
CREATE TABLE "SecurityProperty" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "description" TEXT,
    "siteLabel" TEXT,
    "siteTimezone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityPropertyMember" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessRole" "SecurityPropertyAccessRole" NOT NULL DEFAULT 'Viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityPropertyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityZone" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "statusLabel" TEXT NOT NULL DEFAULT 'Not mapped',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityDevice" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "zoneId" TEXT,
    "name" TEXT NOT NULL,
    "deviceType" "SecurityDeviceType" NOT NULL,
    "status" "SecurityDeviceStatus" NOT NULL DEFAULT 'UNCONFIGURED',
    "manufacturer" TEXT,
    "modelName" TEXT,
    "serialNumber" TEXT,
    "firmwareVersion" TEXT,
    "ipAddress" TEXT,
    "resolutionLabel" TEXT,
    "preferredTransport" "CameraTransport",
    "supportsOnvif" BOOLEAN NOT NULL DEFAULT false,
    "supportsRtsp" BOOLEAN NOT NULL DEFAULT false,
    "supportsPtz" BOOLEAN NOT NULL DEFAULT false,
    "isRecordingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "installedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CameraStreamProfile" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "CameraStreamKind" NOT NULL DEFAULT 'LIVE',
    "transport" "CameraTransport" NOT NULL,
    "status" "CameraStreamStatus" NOT NULL DEFAULT 'UNCONFIGURED',
    "streamPath" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "fps" INTEGER,
    "bitrateKbps" INTEGER,
    "codec" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "lastCheckedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CameraStreamProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CameraHealthSample" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL,
    "latencyMs" INTEGER,
    "bitrateKbps" INTEGER,
    "frameRate" DOUBLE PRECISION,
    "packetLossPct" DOUBLE PRECISION,
    "note" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CameraHealthSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "previewUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "bytes" INTEGER,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordingClip" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "previewUrl" TEXT,
    "mimeType" TEXT,
    "bytes" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "durationSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecordingClip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityAlert" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "zoneId" TEXT,
    "deviceId" TEXT,
    "severity" "SecurityAlertSeverity" NOT NULL DEFAULT 'INFO',
    "status" "SecurityAlertStatus" NOT NULL DEFAULT 'Open',
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "zoneId" TEXT,
    "deviceId" TEXT,
    "eventType" "SecurityEventType" NOT NULL DEFAULT 'MANUAL',
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "actorLabel" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityServiceTicket" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "priority" "ServiceTicketPriority" NOT NULL DEFAULT 'Medium',
    "status" "ServiceTicketStatus" NOT NULL DEFAULT 'Open',
    "openedByLabel" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityServiceTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityInvoice" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'Open',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityDocument" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL DEFAULT 'Operations',
    "summary" TEXT,
    "storageKey" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityAuditLog" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "actorUserId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SecurityProperty_ownerId_idx" ON "SecurityProperty"("ownerId");

-- CreateIndex
CREATE INDEX "SecurityProperty_ownerId_updatedAt_idx" ON "SecurityProperty"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "SecurityPropertyMember_userId_idx" ON "SecurityPropertyMember"("userId");

-- CreateIndex
CREATE INDEX "SecurityPropertyMember_propertyId_idx" ON "SecurityPropertyMember"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityPropertyMember_propertyId_userId_key" ON "SecurityPropertyMember"("propertyId", "userId");

-- CreateIndex
CREATE INDEX "SecurityZone_propertyId_idx" ON "SecurityZone"("propertyId");

-- CreateIndex
CREATE INDEX "SecurityZone_propertyId_sortOrder_idx" ON "SecurityZone"("propertyId", "sortOrder");

-- CreateIndex
CREATE INDEX "SecurityDevice_propertyId_idx" ON "SecurityDevice"("propertyId");

-- CreateIndex
CREATE INDEX "SecurityDevice_propertyId_deviceType_idx" ON "SecurityDevice"("propertyId", "deviceType");

-- CreateIndex
CREATE INDEX "SecurityDevice_propertyId_status_idx" ON "SecurityDevice"("propertyId", "status");

-- CreateIndex
CREATE INDEX "SecurityDevice_propertyId_deviceType_updatedAt_idx" ON "SecurityDevice"("propertyId", "deviceType", "updatedAt");

-- CreateIndex
CREATE INDEX "SecurityDevice_zoneId_idx" ON "SecurityDevice"("zoneId");

-- CreateIndex
CREATE INDEX "CameraStreamProfile_deviceId_idx" ON "CameraStreamProfile"("deviceId");

-- CreateIndex
CREATE INDEX "CameraStreamProfile_deviceId_status_idx" ON "CameraStreamProfile"("deviceId", "status");

-- CreateIndex
CREATE INDEX "CameraStreamProfile_deviceId_kind_idx" ON "CameraStreamProfile"("deviceId", "kind");

-- CreateIndex
CREATE INDEX "CameraHealthSample_deviceId_capturedAt_idx" ON "CameraHealthSample"("deviceId", "capturedAt");

-- CreateIndex
CREATE INDEX "Snapshot_deviceId_capturedAt_idx" ON "Snapshot"("deviceId", "capturedAt");

-- CreateIndex
CREATE INDEX "RecordingClip_deviceId_startedAt_idx" ON "RecordingClip"("deviceId", "startedAt");

-- CreateIndex
CREATE INDEX "SecurityAlert_propertyId_status_idx" ON "SecurityAlert"("propertyId", "status");

-- CreateIndex
CREATE INDEX "SecurityAlert_propertyId_triggeredAt_idx" ON "SecurityAlert"("propertyId", "triggeredAt");

-- CreateIndex
CREATE INDEX "SecurityAlert_zoneId_idx" ON "SecurityAlert"("zoneId");

-- CreateIndex
CREATE INDEX "SecurityAlert_deviceId_idx" ON "SecurityAlert"("deviceId");

-- CreateIndex
CREATE INDEX "SecurityEvent_propertyId_occurredAt_idx" ON "SecurityEvent"("propertyId", "occurredAt");

-- CreateIndex
CREATE INDEX "SecurityEvent_zoneId_idx" ON "SecurityEvent"("zoneId");

-- CreateIndex
CREATE INDEX "SecurityEvent_deviceId_idx" ON "SecurityEvent"("deviceId");

-- CreateIndex
CREATE INDEX "SecurityServiceTicket_propertyId_status_idx" ON "SecurityServiceTicket"("propertyId", "status");

-- CreateIndex
CREATE INDEX "SecurityServiceTicket_propertyId_priority_idx" ON "SecurityServiceTicket"("propertyId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityInvoice_invoiceNumber_key" ON "SecurityInvoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "SecurityInvoice_propertyId_status_idx" ON "SecurityInvoice"("propertyId", "status");

-- CreateIndex
CREATE INDEX "SecurityInvoice_propertyId_dueDate_idx" ON "SecurityInvoice"("propertyId", "dueDate");

-- CreateIndex
CREATE INDEX "SecurityDocument_propertyId_category_idx" ON "SecurityDocument"("propertyId", "category");

-- CreateIndex
CREATE INDEX "SecurityDocument_propertyId_uploadedAt_idx" ON "SecurityDocument"("propertyId", "uploadedAt");

-- CreateIndex
CREATE INDEX "SecurityAuditLog_propertyId_createdAt_idx" ON "SecurityAuditLog"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityAuditLog_actorUserId_createdAt_idx" ON "SecurityAuditLog"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "SecurityProperty" ADD CONSTRAINT "SecurityProperty_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityPropertyMember" ADD CONSTRAINT "SecurityPropertyMember_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "SecurityProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityPropertyMember" ADD CONSTRAINT "SecurityPropertyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityZone" ADD CONSTRAINT "SecurityZone_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "SecurityProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDevice" ADD CONSTRAINT "SecurityDevice_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "SecurityProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDevice" ADD CONSTRAINT "SecurityDevice_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "SecurityZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CameraStreamProfile" ADD CONSTRAINT "CameraStreamProfile_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "SecurityDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CameraHealthSample" ADD CONSTRAINT "CameraHealthSample_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "SecurityDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "SecurityDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordingClip" ADD CONSTRAINT "RecordingClip_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "SecurityDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAlert" ADD CONSTRAINT "SecurityAlert_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "SecurityProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAlert" ADD CONSTRAINT "SecurityAlert_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "SecurityZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAlert" ADD CONSTRAINT "SecurityAlert_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "SecurityDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "SecurityProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "SecurityZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "SecurityDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityServiceTicket" ADD CONSTRAINT "SecurityServiceTicket_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "SecurityProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityInvoice" ADD CONSTRAINT "SecurityInvoice_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "SecurityProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDocument" ADD CONSTRAINT "SecurityDocument_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "SecurityProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAuditLog" ADD CONSTRAINT "SecurityAuditLog_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "SecurityProperty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAuditLog" ADD CONSTRAINT "SecurityAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
