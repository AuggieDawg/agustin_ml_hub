import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import {
  CameraStreamKind,
  CameraStreamStatus,
  CameraTransport,
  DocumentCategory,
  InvoiceStatus,
  PrismaClient,
  SecurityAlertSeverity,
  SecurityAlertStatus,
  SecurityDeviceStatus,
  SecurityDeviceType,
  SecurityEventType,
  ServiceTicketPriority,
  ServiceTicketStatus,
} from "@prisma/client"

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL || DATABASE_URL.trim().length === 0) {
  throw new Error(
    'DATABASE_URL is missing. Ensure it exists in .env before running the seed script.',
  )
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
})

const DEMO_SITE_LABEL = "demo-home-security-lab"
const DEMO_PROPERTY_NAME = "Demo Home Security Lab"

async function main() {
  const emailArg = process.argv[2]?.trim()

  if (!emailArg) {
    throw new Error(
      'Usage: npm run seed:security-demo -- "you@example.com"',
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: emailArg },
    select: {
      id: true,
      email: true,
      name: true,
    },
  })

  if (!user) {
    throw new Error(
      `No user found for ${emailArg}. Sign in to the app first so the user record exists, then re-run the seed.`,
    )
  }

  const existingProperty = await prisma.securityProperty.findFirst({
    where: {
      ownerId: user.id,
      siteLabel: DEMO_SITE_LABEL,
    },
    select: {
      id: true,
      zones: {
        select: { id: true },
      },
      devices: {
        select: { id: true },
      },
    },
  })

  const property = await prisma.$transaction(async (tx) => {
    if (existingProperty) {
      const existingDeviceIds = existingProperty.devices.map((device) => device.id)

      if (existingDeviceIds.length > 0) {
        await tx.recordingClip.deleteMany({
          where: {
            deviceId: { in: existingDeviceIds },
          },
        })

        await tx.snapshot.deleteMany({
          where: {
            deviceId: { in: existingDeviceIds },
          },
        })

        await tx.cameraHealthSample.deleteMany({
          where: {
            deviceId: { in: existingDeviceIds },
          },
        })

        await tx.cameraStreamProfile.deleteMany({
          where: {
            deviceId: { in: existingDeviceIds },
          },
        })
      }

      await tx.securityAuditLog.deleteMany({
        where: { propertyId: existingProperty.id },
      })

      await tx.securityDocument.deleteMany({
        where: { propertyId: existingProperty.id },
      })

      await tx.securityInvoice.deleteMany({
        where: { propertyId: existingProperty.id },
      })

      await tx.securityServiceTicket.deleteMany({
        where: { propertyId: existingProperty.id },
      })

      await tx.securityAlert.deleteMany({
        where: { propertyId: existingProperty.id },
      })

      await tx.securityEvent.deleteMany({
        where: { propertyId: existingProperty.id },
      })

      await tx.securityDevice.deleteMany({
        where: { propertyId: existingProperty.id },
      })

      await tx.securityZone.deleteMany({
        where: { propertyId: existingProperty.id },
      })

      return tx.securityProperty.update({
        where: { id: existingProperty.id },
        data: {
          name: DEMO_PROPERTY_NAME,
          nickname: "Security Demo",
          description:
            "Seeded demo property for validating the client security portal against database-backed records.",
          siteLabel: DEMO_SITE_LABEL,
          siteTimezone: "America/Denver",
          isActive: true,
        },
      })
    }

    return tx.securityProperty.create({
      data: {
        ownerId: user.id,
        name: DEMO_PROPERTY_NAME,
        nickname: "Security Demo",
        description:
          "Seeded demo property for validating the client security portal against database-backed records.",
        siteLabel: DEMO_SITE_LABEL,
        siteTimezone: "America/Denver",
        isActive: true,
      },
    })
  })

  const now = new Date()

  const frontEntryZone = await prisma.securityZone.create({
    data: {
      propertyId: property.id,
      name: "Front Entry",
      statusLabel: "Covered",
      sortOrder: 1,
      note: "Primary entry coverage with camera, contact, and lock visibility.",
    },
  })

  const livingRoomZone = await prisma.securityZone.create({
    data: {
      propertyId: property.id,
      name: "Living Room",
      statusLabel: "Monitored",
      sortOrder: 2,
      note: "Interior activity zone with motion-aware camera coverage.",
    },
  })

  const garageZone = await prisma.securityZone.create({
    data: {
      propertyId: property.id,
      name: "Garage",
      statusLabel: "Needs review",
      sortOrder: 3,
      note: "Good zone for testing degraded feeds and recovery flows.",
    },
  })

  const backyardZone = await prisma.securityZone.create({
    data: {
      propertyId: property.id,
      name: "Backyard",
      statusLabel: "Awaiting stream setup",
      sortOrder: 4,
      note: "Camera installed in inventory, but primary stream is not configured yet.",
    },
  })

  const frontDoorCamera = await prisma.securityDevice.create({
    data: {
      propertyId: property.id,
      zoneId: frontEntryZone.id,
      name: "Front Door Camera",
      deviceType: SecurityDeviceType.CAMERA,
      status: SecurityDeviceStatus.ONLINE,
      manufacturer: "Reolink",
      modelName: "4K PoE Demo Cam",
      firmwareVersion: "FW 2.3.1",
      resolutionLabel: "3840×2160",
      preferredTransport: CameraTransport.HLS,
      supportsOnvif: true,
      supportsRtsp: true,
      isRecordingEnabled: true,
      installedAt: hoursAgo(72),
      lastSeenAt: secondsAgo(14),
      notes: "Healthy primary camera for the entry path.",
    },
  })

  const livingRoomCamera = await prisma.securityDevice.create({
    data: {
      propertyId: property.id,
      zoneId: livingRoomZone.id,
      name: "Living Room Camera",
      deviceType: SecurityDeviceType.CAMERA,
      status: SecurityDeviceStatus.ONLINE,
      manufacturer: "Reolink",
      modelName: "4K PoE Demo Cam",
      firmwareVersion: "FW 2.3.1",
      resolutionLabel: "3840×2160",
      preferredTransport: CameraTransport.WEBRTC,
      supportsOnvif: true,
      supportsRtsp: true,
      isRecordingEnabled: true,
      installedAt: hoursAgo(48),
      lastSeenAt: secondsAgo(21),
      notes: "Active camera that is still negotiating browser delivery.",
    },
  })

  const garageCamera = await prisma.securityDevice.create({
    data: {
      propertyId: property.id,
      zoneId: garageZone.id,
      name: "Garage Camera",
      deviceType: SecurityDeviceType.CAMERA,
      status: SecurityDeviceStatus.WARNING,
      manufacturer: "Reolink",
      modelName: "4K PoE Demo Cam",
      firmwareVersion: "FW 2.2.9",
      resolutionLabel: "3840×2160",
      preferredTransport: CameraTransport.HLS,
      supportsOnvif: true,
      supportsRtsp: true,
      isRecordingEnabled: true,
      installedAt: hoursAgo(36),
      lastSeenAt: minutesAgo(4),
      notes: "Useful for degraded-state testing.",
    },
  })

  const backyardCamera = await prisma.securityDevice.create({
    data: {
      propertyId: property.id,
      zoneId: backyardZone.id,
      name: "Backyard Camera",
      deviceType: SecurityDeviceType.CAMERA,
      status: SecurityDeviceStatus.UNCONFIGURED,
      manufacturer: "Reolink",
      modelName: "4K PoE Demo Cam",
      firmwareVersion: "FW 2.3.1",
      resolutionLabel: "3840×2160",
      preferredTransport: CameraTransport.RTSP,
      supportsOnvif: true,
      supportsRtsp: true,
      isRecordingEnabled: false,
      installedAt: hoursAgo(12),
      lastSeenAt: null,
      notes: "Present in inventory, but primary stream profile intentionally missing.",
    },
  })

  const frontDoorContact = await prisma.securityDevice.create({
    data: {
      propertyId: property.id,
      zoneId: frontEntryZone.id,
      name: "Front Door Contact",
      deviceType: SecurityDeviceType.DOOR_SENSOR,
      status: SecurityDeviceStatus.ONLINE,
      manufacturer: "Demo Sensor Co.",
      modelName: "Door Contact 1",
      firmwareVersion: "SEN 1.8.4",
      installedAt: hoursAgo(72),
      lastSeenAt: secondsAgo(7),
      notes: "Primary contact sensor.",
    },
  })

  const hallwaySmokeDetector = await prisma.securityDevice.create({
    data: {
      propertyId: property.id,
      zoneId: livingRoomZone.id,
      name: "Hallway Smoke Detector",
      deviceType: SecurityDeviceType.SMOKE_DETECTOR,
      status: SecurityDeviceStatus.WARNING,
      manufacturer: "Demo Sensor Co.",
      modelName: "Smoke Guard 4",
      firmwareVersion: "SAFE 4.0.2",
      installedAt: hoursAgo(60),
      lastSeenAt: secondsAgo(52),
      notes: "Low-battery style warning state for portal testing.",
    },
  })

  await prisma.cameraStreamProfile.createMany({
    data: [
      {
        deviceId: frontDoorCamera.id,
        label: "Primary Browser Feed",
        kind: CameraStreamKind.LIVE,
        transport: CameraTransport.HLS,
        status: CameraStreamStatus.LIVE,
        streamPath: "/demo/front-door/master.m3u8",
        width: 3840,
        height: 2160,
        fps: 15,
        bitrateKbps: 6000,
        codec: "H.265",
        isPrimary: true,
        lastCheckedAt: secondsAgo(20),
      },
      {
        deviceId: livingRoomCamera.id,
        label: "Primary Browser Feed",
        kind: CameraStreamKind.LIVE,
        transport: CameraTransport.WEBRTC,
        status: CameraStreamStatus.CONNECTING,
        streamPath: "webrtc://demo/living-room",
        width: 3840,
        height: 2160,
        fps: 15,
        bitrateKbps: 5500,
        codec: "H.265",
        isPrimary: true,
        lastCheckedAt: secondsAgo(30),
        lastError: "ICE negotiation still in progress.",
      },
      {
        deviceId: garageCamera.id,
        label: "Primary Browser Feed",
        kind: CameraStreamKind.LIVE,
        transport: CameraTransport.HLS,
        status: CameraStreamStatus.DEGRADED,
        streamPath: "/demo/garage/master.m3u8",
        width: 3840,
        height: 2160,
        fps: 12,
        bitrateKbps: 3200,
        codec: "H.265",
        isPrimary: true,
        lastCheckedAt: minutesAgo(3),
        lastError: "Bitrate instability detected.",
      },
    ],
  })

  await prisma.cameraHealthSample.createMany({
    data: [
      {
        deviceId: frontDoorCamera.id,
        isOnline: true,
        latencyMs: 42,
        bitrateKbps: 5900,
        frameRate: 15,
        packetLossPct: 0.2,
        note: "Healthy live feed.",
        capturedAt: secondsAgo(20),
      },
      {
        deviceId: livingRoomCamera.id,
        isOnline: true,
        latencyMs: 95,
        bitrateKbps: 4700,
        frameRate: 13.5,
        packetLossPct: 0.9,
        note: "Connecting state; acceptable network path.",
        capturedAt: secondsAgo(30),
      },
      {
        deviceId: garageCamera.id,
        isOnline: true,
        latencyMs: 240,
        bitrateKbps: 2800,
        frameRate: 8.8,
        packetLossPct: 4.4,
        note: "Degraded quality for testing warnings.",
        capturedAt: minutesAgo(3),
      },
    ],
  })

  await prisma.securityAlert.createMany({
    data: [
      {
        propertyId: property.id,
        zoneId: frontEntryZone.id,
        deviceId: frontDoorContact.id,
        severity: SecurityAlertSeverity.CRITICAL,
        status: SecurityAlertStatus.Open,
        title: "Front Door Opened While Armed",
        detail: "Primary entry contact reported open while the property was in an armed state.",
        triggeredAt: minutesAgo(18),
      },
      {
        propertyId: property.id,
        zoneId: garageZone.id,
        deviceId: garageCamera.id,
        severity: SecurityAlertSeverity.WARNING,
        status: SecurityAlertStatus.Acknowledged,
        title: "Garage Camera Feed Degraded",
        detail: "Packet loss and bitrate instability were detected on the garage feed.",
        triggeredAt: minutesAgo(42),
      },
      {
        propertyId: property.id,
        zoneId: livingRoomZone.id,
        deviceId: hallwaySmokeDetector.id,
        severity: SecurityAlertSeverity.INFO,
        status: SecurityAlertStatus.Resolved,
        title: "Smoke Detector Battery Warning Logged",
        detail: "A warning condition was recorded and later acknowledged for testing.",
        triggeredAt: hoursAgo(5),
        resolvedAt: hoursAgo(4),
      },
    ],
  })

  await prisma.securityEvent.createMany({
    data: [
      {
        propertyId: property.id,
        zoneId: frontEntryZone.id,
        deviceId: frontDoorContact.id,
        eventType: SecurityEventType.DOOR_OPENED,
        title: "Front Door Opened",
        detail: "Contact sensor registered an open event on the primary entry.",
        actorLabel: "System",
        occurredAt: minutesAgo(18),
      },
      {
        propertyId: property.id,
        zoneId: livingRoomZone.id,
        deviceId: livingRoomCamera.id,
        eventType: SecurityEventType.MOTION_DETECTED,
        title: "Interior Motion Detected",
        detail: "Living room motion activity was recorded for timeline validation.",
        actorLabel: "System",
        occurredAt: minutesAgo(26),
      },
      {
        propertyId: property.id,
        zoneId: garageZone.id,
        deviceId: garageCamera.id,
        eventType: SecurityEventType.CAMERA_OFFLINE,
        title: "Garage Feed Quality Dropped",
        detail: "Media gateway marked the garage stream as degraded.",
        actorLabel: "Media gateway",
        occurredAt: minutesAgo(42),
      },
      {
        propertyId: property.id,
        zoneId: frontEntryZone.id,
        deviceId: frontDoorCamera.id,
        eventType: SecurityEventType.SYSTEM_ARMED,
        title: "System Armed Away",
        detail: "Demo event added so the overview timeline has a clear state transition.",
        actorLabel: user.name ?? user.email,
        occurredAt: hoursAgo(2),
      },
    ],
  })

  await prisma.securityServiceTicket.createMany({
    data: [
      {
        propertyId: property.id,
        title: "Investigate garage camera stability",
        detail: "Review network path and stream delivery for repeated degradation.",
        priority: ServiceTicketPriority.High,
        status: ServiceTicketStatus.Open,
        openedByLabel: "Portal demo seed",
        createdAt: hoursAgo(3),
      },
      {
        propertyId: property.id,
        title: "Quarterly device health review",
        detail: "General maintenance and connectivity verification.",
        priority: ServiceTicketPriority.Medium,
        status: ServiceTicketStatus.Scheduled,
        openedByLabel: "Portal demo seed",
        scheduledFor: daysFromNow(2),
        createdAt: hoursAgo(12),
      },
    ],
  })

  await prisma.securityInvoice.createMany({
    data: [
      {
        propertyId: property.id,
        invoiceNumber: "INV-DEMO-1001",
        amountCents: 12000,
        currency: "USD",
        dueDate: daysFromNow(9),
        status: InvoiceStatus.Open,
        issuedAt: hoursAgo(20),
        note: "Open monitored service invoice for portal validation.",
      },
      {
        propertyId: property.id,
        invoiceNumber: "INV-DEMO-0998",
        amountCents: 8900,
        currency: "USD",
        dueDate: daysAgo(18),
        status: InvoiceStatus.Paid,
        issuedAt: daysAgo(30),
        paidAt: daysAgo(16),
        note: "Paid invoice for status contrast.",
      },
    ],
  })

  await prisma.securityDocument.createMany({
    data: [
      {
        propertyId: property.id,
        name: "Installation Summary",
        category: DocumentCategory.Operations,
        summary:
          "Mounted hardware list, zone placement summary, and operational setup notes.",
        storageKey: "demo/docs/installation-summary.pdf",
        uploadedAt: hoursAgo(6),
      },
      {
        propertyId: property.id,
        name: "Warranty Packet",
        category: DocumentCategory.Warranty,
        summary:
          "Warranty references for installed camera and sensor hardware.",
        storageKey: "demo/docs/warranty-packet.pdf",
        uploadedAt: hoursAgo(5),
      },
      {
        propertyId: property.id,
        name: "Service Agreement",
        category: DocumentCategory.Commercial,
        summary:
          "Monitored service scope, support expectations, and commercial terms.",
        storageKey: "demo/docs/service-agreement.pdf",
        uploadedAt: hoursAgo(4),
      },
    ],
  })

  await prisma.securityAuditLog.create({
    data: {
      propertyId: property.id,
      actorUserId: user.id,
      entityType: "SecurityProperty",
      entityId: property.id,
      action: "seeded_demo_property",
      metadata: {
        siteLabel: DEMO_SITE_LABEL,
        ownerEmail: user.email,
        seededAt: now.toISOString(),
      },
    },
  })

  const summary = await prisma.securityProperty.findUnique({
    where: { id: property.id },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          zones: true,
          devices: true,
          alerts: true,
          events: true,
          serviceTickets: true,
          invoices: true,
          documents: true,
        },
      },
    },
  })

  console.log("")
  console.log("✅ Security demo seed complete")
  console.log(`Owner: ${user.email}`)
  console.log(`Property: ${summary?.name}`)
  console.log(`Property ID: ${summary?.id}`)
  console.log(`Zones: ${summary?._count.zones ?? 0}`)
  console.log(`Devices: ${summary?._count.devices ?? 0}`)
  console.log(`Alerts: ${summary?._count.alerts ?? 0}`)
  console.log(`Events: ${summary?._count.events ?? 0}`)
  console.log(`Service tickets: ${summary?._count.serviceTickets ?? 0}`)
  console.log(`Invoices: ${summary?._count.invoices ?? 0}`)
  console.log(`Documents: ${summary?._count.documents ?? 0}`)
  console.log("")
}

function secondsAgo(value: number) {
  return new Date(Date.now() - value * 1000)
}

function minutesAgo(value: number) {
  return new Date(Date.now() - value * 60 * 1000)
}

function hoursAgo(value: number) {
  return new Date(Date.now() - value * 60 * 60 * 1000)
}

function daysAgo(value: number) {
  return new Date(Date.now() - value * 24 * 60 * 60 * 1000)
}

function daysFromNow(value: number) {
  return new Date(Date.now() + value * 24 * 60 * 60 * 1000)
}

main()
  .catch((error) => {
    console.error("")
    console.error("❌ Failed to seed security demo")
    console.error(error)
    console.error("")
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })