import {
  CameraStreamStatus,
  CameraTransport,
  DocumentCategory,
  InvoiceStatus,
  SecurityAlertSeverity,
  SecurityAlertStatus,
  SecurityDeviceStatus,
  SecurityDeviceType,
  ServiceTicketStatus,
} from "@prisma/client"

import { prisma } from "@/lib/db/prisma"

export type PortalTone = "healthy" | "warning" | "critical" | "info"

export type CameraFeedStateKey =
  | "NO_PROFILE"
  | "UNCONFIGURED"
  | "CONNECTING"
  | "LIVE"
  | "DEGRADED"
  | "OFFLINE"

export type ClientPortalMetric = {
  label: string
  value: string
  helper: string
  tone: PortalTone
}

export type ClientPortalZone = {
  id: string
  name: string
  statusLabel: string
  note: string | null
  deviceCount: number
}

export type ClientPortalAlert = {
  id: string
  title: string
  detail: string | null
  timeLabel: string
  zoneLabel: string
  statusLabel: string
  tone: PortalTone
}

export type ClientPortalEvent = {
  id: string
  title: string
  detail: string | null
  actorLabel: string
  timeLabel: string
}

export type ClientPortalCameraFeed = {
  id: string
  title: string
  locationLabel: string
  summary: string
  tone: PortalTone
  stateLabel: string
  stateKey: CameraFeedStateKey
  transportLabel: string | null
  resolutionLabel: string | null
}

export type ClientPortalDevice = {
  id: string
  name: string
  typeLabel: string
  zoneLabel: string
  statusLabel: string
  tone: PortalTone
  lastSeenLabel: string
  firmwareLabel: string
  resolutionLabel: string | null
}

export type ClientPortalServiceTicket = {
  id: string
  title: string
  detail: string | null
  statusLabel: string
  priorityLabel: string
  openedByLabel: string
  scheduledForLabel: string | null
  tone: PortalTone
  createdAtLabel: string
}

export type ClientPortalInvoice = {
  id: string
  invoiceNumber: string
  amountLabel: string
  dueDateLabel: string
  statusLabel: string
  tone: PortalTone
}

export type ClientPortalDocument = {
  id: string
  name: string
  summary: string | null
  categoryLabel: string
  uploadedAtLabel: string
}

export type ClientPortalOverviewData = {
  property: { id: string; name: string } | null
  metrics: ClientPortalMetric[]
  zones: ClientPortalZone[]
  alerts: ClientPortalAlert[]
  events: ClientPortalEvent[]
  cameraFeeds: ClientPortalCameraFeed[]
}

export type ClientPortalCamerasData = {
  property: { id: string; name: string } | null
  cameras: ClientPortalCameraFeed[]
}

export type ClientPortalDevicesData = {
  property: { id: string; name: string } | null
  metrics: ClientPortalMetric[]
  devices: ClientPortalDevice[]
}

export type ClientPortalAlertsData = {
  property: { id: string; name: string } | null
  metrics: ClientPortalMetric[]
  alerts: ClientPortalAlert[]
  events: ClientPortalEvent[]
}

export type ClientPortalServiceData = {
  property: { id: string; name: string } | null
  metrics: ClientPortalMetric[]
  tickets: ClientPortalServiceTicket[]
}

export type ClientPortalBillingData = {
  property: { id: string; name: string } | null
  metrics: ClientPortalMetric[]
  invoices: ClientPortalInvoice[]
}

export type ClientPortalDocumentsData = {
  property: { id: string; name: string } | null
  metrics: ClientPortalMetric[]
  documents: ClientPortalDocument[]
}

export async function getClientPortalOverview(
  userId: string,
): Promise<ClientPortalOverviewData> {
  const property = await getPrimaryAccessibleProperty(userId)

  if (!property) {
    return {
      property: null,
      metrics: [
        {
          label: "System Status",
          value: "Awaiting setup",
          helper: "Create a property to begin",
          tone: "info",
        },
        {
          label: "System Health",
          value: "No devices yet",
          helper: "Health appears after device enrollment",
          tone: "info",
        },
        {
          label: "Active Alerts",
          value: "0",
          helper: "Alerts appear when devices report events",
          tone: "healthy",
        },
        {
          label: "Devices Online",
          value: "0",
          helper: "No live device telemetry yet",
          tone: "info",
        },
      ],
      zones: [],
      alerts: [],
      events: [],
      cameraFeeds: [],
    }
  }

  const [zones, alerts, events, deviceCounts, cameraFeeds] = await Promise.all([
    prisma.securityZone.findMany({
      where: { propertyId: property.id },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 4,
      select: {
        id: true,
        name: true,
        statusLabel: true,
        note: true,
        _count: {
          select: {
            devices: true,
          },
        },
      },
    }),
    prisma.securityAlert.findMany({
      where: {
        propertyId: property.id,
        status: {
          in: [SecurityAlertStatus.Open, SecurityAlertStatus.Acknowledged],
        },
      },
      orderBy: { triggeredAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        detail: true,
        severity: true,
        status: true,
        triggeredAt: true,
        zone: {
          select: { name: true },
        },
      },
    }),
    prisma.securityEvent.findMany({
      where: { propertyId: property.id },
      orderBy: { occurredAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        detail: true,
        actorLabel: true,
        occurredAt: true,
      },
    }),
    getDeviceCounts(property.id),
    getCameraFeedsByPropertyId(property.id, 4),
  ])

  const systemStatus =
    deviceCounts.total === 0
      ? {
          value: "Ready to configure",
          helper: "Add your first monitored device",
          tone: "info" as const,
        }
      : alerts.length > 0
        ? {
            value: "Attention needed",
            helper: `${alerts.length} active alert${alerts.length === 1 ? "" : "s"}`,
            tone: alerts.some((alert) => alert.severity === SecurityAlertSeverity.CRITICAL)
              ? ("critical" as const)
              : ("warning" as const),
          }
        : {
            value: "Monitoring",
            helper: "No active incidents right now",
            tone: "healthy" as const,
          }

  const systemHealth =
    deviceCounts.total === 0
      ? {
          value: "No devices yet",
          helper: "Health appears after enrollment",
          tone: "info" as const,
        }
      : deviceCounts.offline > 0 || deviceCounts.warning > 0
        ? {
            value: "Degraded",
            helper: `${deviceCounts.offline + deviceCounts.warning} device issue${deviceCounts.offline + deviceCounts.warning === 1 ? "" : "s"}`,
            tone: "warning" as const,
          }
        : {
            value: "Healthy",
            helper: "Core devices are reporting",
            tone: "healthy" as const,
          }

  return {
    property: { id: property.id, name: property.name },
    metrics: [
      {
        label: "System Status",
        value: systemStatus.value,
        helper: systemStatus.helper,
        tone: systemStatus.tone,
      },
      {
        label: "System Health",
        value: systemHealth.value,
        helper: systemHealth.helper,
        tone: systemHealth.tone,
      },
      {
        label: "Active Alerts",
        value: String(alerts.length),
        helper: "Open or acknowledged incidents",
        tone:
          alerts.length === 0
            ? "healthy"
            : alerts.some((alert) => alert.severity === SecurityAlertSeverity.CRITICAL)
              ? "critical"
              : "warning",
      },
      {
        label: "Devices Online",
        value: String(deviceCounts.online),
        helper: `${deviceCounts.total} configured device${deviceCounts.total === 1 ? "" : "s"}`,
        tone: deviceCounts.online > 0 ? "healthy" : "info",
      },
    ],
    zones: zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      statusLabel: zone.statusLabel,
      note: zone.note,
      deviceCount: zone._count.devices,
    })),
    alerts: alerts.map((alert) => ({
      id: alert.id,
      title: alert.title,
      detail: alert.detail,
      timeLabel: formatTimeLabel(alert.triggeredAt),
      zoneLabel: alert.zone?.name ?? "Unassigned zone",
      statusLabel: securityAlertStatusToLabel(alert.status),
      tone: alertSeverityToTone(alert.severity),
    })),
    events: events.map((event) => ({
      id: event.id,
      title: event.title,
      detail: event.detail,
      actorLabel: event.actorLabel ?? "System",
      timeLabel: formatDateTimeLabel(event.occurredAt),
    })),
    cameraFeeds,
  }
}

export async function getClientPortalCameras(
  userId: string,
): Promise<ClientPortalCamerasData> {
  const property = await getPrimaryAccessibleProperty(userId)

  if (!property) {
    return { property: null, cameras: [] }
  }

  return {
    property: { id: property.id, name: property.name },
    cameras: await getCameraFeedsByPropertyId(property.id, 12),
  }
}

export async function getClientPortalDevices(
  userId: string,
): Promise<ClientPortalDevicesData> {
  const property = await getPrimaryAccessibleProperty(userId)

  if (!property) {
    return {
      property: null,
      metrics: buildEmptyMetrics("Devices"),
      devices: [],
    }
  }

  const [counts, devices] = await Promise.all([
    getDeviceCounts(property.id),
    prisma.securityDevice.findMany({
      where: { propertyId: property.id },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        deviceType: true,
        status: true,
        firmwareVersion: true,
        resolutionLabel: true,
        lastSeenAt: true,
        zone: {
          select: { name: true },
        },
      },
    }),
  ])

  return {
    property: { id: property.id, name: property.name },
    metrics: [
      {
        label: "Installed Devices",
        value: String(counts.total),
        helper: "Property-scoped hardware records",
        tone: counts.total > 0 ? "healthy" : "info",
      },
      {
        label: "Camera Devices",
        value: String(counts.cameras),
        helper: "Video-capable endpoints",
        tone: counts.cameras > 0 ? "healthy" : "info",
      },
      {
        label: "Needs Attention",
        value: String(counts.warning + counts.offline + counts.unconfigured),
        helper: "Offline, warning, or not configured",
        tone:
          counts.warning + counts.offline + counts.unconfigured > 0
            ? "warning"
            : "healthy",
      },
    ],
    devices: devices.map((device) => ({
      id: device.id,
      name: device.name,
      typeLabel: deviceTypeToLabel(device.deviceType),
      zoneLabel: device.zone?.name ?? "Unassigned zone",
      statusLabel: deviceStatusToLabel(device.status),
      tone: deviceStatusToTone(device.status),
      lastSeenLabel: device.lastSeenAt
        ? formatRelativeTimestamp(device.lastSeenAt)
        : "No telemetry yet",
      firmwareLabel: device.firmwareVersion ?? "Firmware not recorded",
      resolutionLabel: device.resolutionLabel,
    })),
  }
}

export async function getClientPortalAlerts(
  userId: string,
): Promise<ClientPortalAlertsData> {
  const property = await getPrimaryAccessibleProperty(userId)

  if (!property) {
    return {
      property: null,
      metrics: buildEmptyMetrics("Alerts"),
      alerts: [],
      events: [],
    }
  }

  const [activeCount, criticalCount, alerts, events] = await Promise.all([
    prisma.securityAlert.count({
      where: {
        propertyId: property.id,
        status: {
          in: [SecurityAlertStatus.Open, SecurityAlertStatus.Acknowledged],
        },
      },
    }),
    prisma.securityAlert.count({
      where: {
        propertyId: property.id,
        status: {
          in: [SecurityAlertStatus.Open, SecurityAlertStatus.Acknowledged],
        },
        severity: SecurityAlertSeverity.CRITICAL,
      },
    }),
    prisma.securityAlert.findMany({
      where: { propertyId: property.id },
      orderBy: { triggeredAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        detail: true,
        severity: true,
        status: true,
        triggeredAt: true,
        zone: {
          select: { name: true },
        },
      },
    }),
    prisma.securityEvent.findMany({
      where: { propertyId: property.id },
      orderBy: { occurredAt: "desc" },
      take: 8,
      select: {
        id: true,
        title: true,
        detail: true,
        actorLabel: true,
        occurredAt: true,
      },
    }),
  ])

  return {
    property: { id: property.id, name: property.name },
    metrics: [
      {
        label: "Active Alerts",
        value: String(activeCount),
        helper: "Open or acknowledged incidents",
        tone: activeCount > 0 ? "warning" : "healthy",
      },
      {
        label: "Critical Alerts",
        value: String(criticalCount),
        helper: "Needs immediate attention",
        tone: criticalCount > 0 ? "critical" : "healthy",
      },
      {
        label: "Recent Events",
        value: String(events.length),
        helper: "Latest property activity records",
        tone: events.length > 0 ? "info" : "healthy",
      },
    ],
    alerts: alerts.map((alert) => ({
      id: alert.id,
      title: alert.title,
      detail: alert.detail,
      timeLabel: formatDateTimeLabel(alert.triggeredAt),
      zoneLabel: alert.zone?.name ?? "Unassigned zone",
      statusLabel: securityAlertStatusToLabel(alert.status),
      tone: alertSeverityToTone(alert.severity),
    })),
    events: events.map((event) => ({
      id: event.id,
      title: event.title,
      detail: event.detail,
      actorLabel: event.actorLabel ?? "System",
      timeLabel: formatDateTimeLabel(event.occurredAt),
    })),
  }
}

export async function getClientPortalService(
  userId: string,
): Promise<ClientPortalServiceData> {
  const property = await getPrimaryAccessibleProperty(userId)

  if (!property) {
    return {
      property: null,
      metrics: buildEmptyMetrics("Service"),
      tickets: [],
    }
  }

  const [openCount, scheduledCount, tickets] = await Promise.all([
    prisma.securityServiceTicket.count({
      where: {
        propertyId: property.id,
        status: {
          in: [ServiceTicketStatus.Open, ServiceTicketStatus.InProgress],
        },
      },
    }),
    prisma.securityServiceTicket.count({
      where: {
        propertyId: property.id,
        status: ServiceTicketStatus.Scheduled,
      },
    }),
    prisma.securityServiceTicket.findMany({
      where: { propertyId: property.id },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        title: true,
        detail: true,
        priority: true,
        status: true,
        openedByLabel: true,
        scheduledFor: true,
        createdAt: true,
      },
    }),
  ])

  return {
    property: { id: property.id, name: property.name },
    metrics: [
      {
        label: "Open Tickets",
        value: String(openCount),
        helper: "Work requiring active attention",
        tone: openCount > 0 ? "warning" : "healthy",
      },
      {
        label: "Scheduled Visits",
        value: String(scheduledCount),
        helper: "Planned service windows",
        tone: scheduledCount > 0 ? "info" : "healthy",
      },
      {
        label: "Total Tickets",
        value: String(tickets.length),
        helper: "Recent service history",
        tone: tickets.length > 0 ? "info" : "healthy",
      },
    ],
    tickets: tickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      detail: ticket.detail,
      statusLabel: serviceTicketStatusToLabel(ticket.status),
      priorityLabel: String(ticket.priority),
      openedByLabel: ticket.openedByLabel ?? "Portal user",
      scheduledForLabel: ticket.scheduledFor
        ? formatDateTimeLabel(ticket.scheduledFor)
        : null,
      tone: serviceTicketStatusToTone(ticket.status),
      createdAtLabel: formatDateTimeLabel(ticket.createdAt),
    })),
  }
}

export async function getClientPortalBilling(
  userId: string,
): Promise<ClientPortalBillingData> {
  const property = await getPrimaryAccessibleProperty(userId)

  if (!property) {
    return {
      property: null,
      metrics: buildEmptyMetrics("Billing"),
      invoices: [],
    }
  }

  const [openInvoices, paidInvoices, invoices] = await Promise.all([
    prisma.securityInvoice.findMany({
      where: {
        propertyId: property.id,
        status: {
          in: [InvoiceStatus.Open, InvoiceStatus.Overdue],
        },
      },
      select: {
        amountCents: true,
      },
    }),
    prisma.securityInvoice.count({
      where: {
        propertyId: property.id,
        status: InvoiceStatus.Paid,
      },
    }),
    prisma.securityInvoice.findMany({
      where: { propertyId: property.id },
      orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        invoiceNumber: true,
        amountCents: true,
        dueDate: true,
        status: true,
      },
    }),
  ])

  const outstandingCents = openInvoices.reduce(
    (sum, invoice) => sum + invoice.amountCents,
    0,
  )

  return {
    property: { id: property.id, name: property.name },
    metrics: [
      {
        label: "Open Invoices",
        value: String(openInvoices.length),
        helper: "Outstanding billing records",
        tone: openInvoices.length > 0 ? "warning" : "healthy",
      },
      {
        label: "Outstanding Balance",
        value: formatCurrencyFromCents(outstandingCents),
        helper: "Open and overdue invoices",
        tone: outstandingCents > 0 ? "warning" : "healthy",
      },
      {
        label: "Paid Invoices",
        value: String(paidInvoices),
        helper: "Completed payments on record",
        tone: paidInvoices > 0 ? "healthy" : "info",
      },
    ],
    invoices: invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber ?? invoice.id,
      amountLabel: formatCurrencyFromCents(invoice.amountCents),
      dueDateLabel: formatDateLabel(invoice.dueDate),
      statusLabel: invoiceStatusToLabel(invoice.status),
      tone: invoiceStatusToTone(invoice.status),
    })),
  }
}

export async function getClientPortalDocuments(
  userId: string,
): Promise<ClientPortalDocumentsData> {
  const property = await getPrimaryAccessibleProperty(userId)

  if (!property) {
    return {
      property: null,
      metrics: buildEmptyMetrics("Documents"),
      documents: [],
    }
  }

  const [documentCount, warrantyCount, documents] = await Promise.all([
    prisma.securityDocument.count({
      where: { propertyId: property.id },
    }),
    prisma.securityDocument.count({
      where: {
        propertyId: property.id,
        category: DocumentCategory.Warranty,
      },
    }),
    prisma.securityDocument.findMany({
      where: { propertyId: property.id },
      orderBy: [{ uploadedAt: "desc" }, { createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        name: true,
        summary: true,
        category: true,
        uploadedAt: true,
      },
    }),
  ])

  return {
    property: { id: property.id, name: property.name },
    metrics: [
      {
        label: "Stored Documents",
        value: String(documentCount),
        helper: "Property-scoped file records",
        tone: documentCount > 0 ? "healthy" : "info",
      },
      {
        label: "Warranty Records",
        value: String(warrantyCount),
        helper: "Warranty-specific documentation",
        tone: warrantyCount > 0 ? "healthy" : "info",
      },
      {
        label: "Latest Upload",
        value: documents[0] ? formatDateLabel(documents[0].uploadedAt) : "None",
        helper: "Most recent portal document",
        tone: documents[0] ? "info" : "healthy",
      },
    ],
    documents: documents.map((document) => ({
      id: document.id,
      name: document.name,
      summary: document.summary,
      categoryLabel: documentCategoryToLabel(document.category),
      uploadedAtLabel: formatDateLabel(document.uploadedAt),
    })),
  }
}

async function getPrimaryAccessibleProperty(userId: string) {
  return prisma.securityProperty.findFirst({
    where: accessiblePropertyWhere(userId),
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
    },
  })
}

function accessiblePropertyWhere(userId: string) {
  return {
    isActive: true,
    OR: [
      { ownerId: userId },
      {
        members: {
          some: {
            userId,
          },
        },
      },
    ],
  }
}

async function getDeviceCounts(propertyId: string) {
  const [total, cameras, online, warning, offline, unconfigured] =
    await Promise.all([
      prisma.securityDevice.count({
        where: { propertyId },
      }),
      prisma.securityDevice.count({
        where: {
          propertyId,
          deviceType: SecurityDeviceType.CAMERA,
        },
      }),
      prisma.securityDevice.count({
        where: {
          propertyId,
          status: SecurityDeviceStatus.ONLINE,
        },
      }),
      prisma.securityDevice.count({
        where: {
          propertyId,
          status: SecurityDeviceStatus.WARNING,
        },
      }),
      prisma.securityDevice.count({
        where: {
          propertyId,
          status: SecurityDeviceStatus.OFFLINE,
        },
      }),
      prisma.securityDevice.count({
        where: {
          propertyId,
          status: SecurityDeviceStatus.UNCONFIGURED,
        },
      }),
    ])

  return {
    total,
    cameras,
    online,
    warning,
    offline,
    unconfigured,
  }
}

async function getCameraFeedsByPropertyId(
  propertyId: string,
  take: number,
): Promise<ClientPortalCameraFeed[]> {
  const devices = await prisma.securityDevice.findMany({
    where: {
      propertyId,
      deviceType: SecurityDeviceType.CAMERA,
    },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    take,
    select: {
      id: true,
      name: true,
      status: true,
      resolutionLabel: true,
      zone: {
        select: {
          name: true,
        },
      },
      streamProfiles: {
        orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
        take: 1,
        select: {
          transport: true,
          status: true,
          width: true,
          height: true,
        },
      },
    },
  })

  return devices.map((device) => {
    const primaryProfile = device.streamProfiles[0]
    const stateKey = getCameraFeedStateKey(primaryProfile?.status)
    const transportLabel = primaryProfile
      ? cameraTransportToLabel(primaryProfile.transport)
      : null

    const resolutionLabel =
      device.resolutionLabel ??
      (primaryProfile?.width && primaryProfile?.height
        ? `${primaryProfile.width}×${primaryProfile.height}`
        : null)

    return {
      id: device.id,
      title: device.name,
      locationLabel: device.zone?.name ?? "Unassigned zone",
      summary: buildCameraSummary({
        deviceStatus: device.status,
        stateKey,
        transportLabel,
      }),
      tone: cameraToneFromState({
        deviceStatus: device.status,
        stateKey,
      }),
      stateLabel: cameraStateLabel(stateKey),
      stateKey,
      transportLabel,
      resolutionLabel,
    }
  })
}

function getCameraFeedStateKey(
  status: CameraStreamStatus | undefined,
): CameraFeedStateKey {
  if (!status) return "NO_PROFILE"

  switch (status) {
    case CameraStreamStatus.UNCONFIGURED:
      return "UNCONFIGURED"
    case CameraStreamStatus.CONNECTING:
      return "CONNECTING"
    case CameraStreamStatus.LIVE:
      return "LIVE"
    case CameraStreamStatus.DEGRADED:
      return "DEGRADED"
    case CameraStreamStatus.OFFLINE:
      return "OFFLINE"
    default:
      return "NO_PROFILE"
  }
}

function cameraStateLabel(stateKey: CameraFeedStateKey) {
  switch (stateKey) {
    case "NO_PROFILE":
      return "Awaiting stream setup"
    case "UNCONFIGURED":
      return "Unconfigured"
    case "CONNECTING":
      return "Connecting"
    case "LIVE":
      return "Live ready"
    case "DEGRADED":
      return "Degraded"
    case "OFFLINE":
      return "Offline"
  }
}

function buildCameraSummary({
  deviceStatus,
  stateKey,
  transportLabel,
}: {
  deviceStatus: SecurityDeviceStatus
  stateKey: CameraFeedStateKey
  transportLabel: string | null
}) {
  if (stateKey === "NO_PROFILE") {
    return "Add a primary stream profile to enable preview, health checks, and browser delivery."
  }

  if (stateKey === "UNCONFIGURED") {
    return "A stream profile exists, but feed delivery has not been finalized yet."
  }

  if (stateKey === "CONNECTING") {
    return "The media gateway is negotiating the stream."
  }

  if (stateKey === "LIVE") {
    return transportLabel
      ? `Primary ${transportLabel} delivery is ready for browser playback.`
      : "Primary stream is ready for browser playback."
  }

  if (stateKey === "DEGRADED") {
    return "The feed is reachable, but quality or health needs attention."
  }

  if (
    deviceStatus === SecurityDeviceStatus.OFFLINE ||
    stateKey === "OFFLINE"
  ) {
    return "The camera or its stream endpoint is currently unavailable."
  }

  return "Camera status will become more detailed as telemetry accumulates."
}

function cameraToneFromState({
  deviceStatus,
  stateKey,
}: {
  deviceStatus: SecurityDeviceStatus
  stateKey: CameraFeedStateKey
}): PortalTone {
  if (stateKey === "LIVE") return "healthy"
  if (
    stateKey === "CONNECTING" ||
    stateKey === "UNCONFIGURED" ||
    stateKey === "NO_PROFILE"
  ) {
    return "info"
  }
  if (stateKey === "DEGRADED" || deviceStatus === SecurityDeviceStatus.WARNING) {
    return "warning"
  }
  if (
    stateKey === "OFFLINE" ||
    deviceStatus === SecurityDeviceStatus.OFFLINE
  ) {
    return "critical"
  }

  return "info"
}

function buildEmptyMetrics(pageLabel: string): ClientPortalMetric[] {
  return [
    {
      label: `${pageLabel} Status`,
      value: "Awaiting setup",
      helper: "Create a property to begin",
      tone: "info",
    },
    {
      label: "Property Records",
      value: "0",
      helper: "No monitored property exists yet",
      tone: "info",
    },
    {
      label: "Operational Activity",
      value: "0",
      helper: "This page will populate from database truth",
      tone: "healthy",
    },
  ]
}

function cameraTransportToLabel(transport: CameraTransport) {
  switch (transport) {
    case CameraTransport.RTSP:
      return "RTSP"
    case CameraTransport.HLS:
      return "HLS"
    case CameraTransport.WEBRTC:
      return "WebRTC"
    case CameraTransport.ONVIF:
      return "ONVIF"
    case CameraTransport.OTHER:
      return "Other"
  }
}

function alertSeverityToTone(severity: SecurityAlertSeverity): PortalTone {
  switch (severity) {
    case SecurityAlertSeverity.CRITICAL:
      return "critical"
    case SecurityAlertSeverity.WARNING:
      return "warning"
    case SecurityAlertSeverity.INFO:
      return "info"
  }
}

function deviceStatusToTone(status: SecurityDeviceStatus): PortalTone {
  switch (status) {
    case SecurityDeviceStatus.ONLINE:
      return "healthy"
    case SecurityDeviceStatus.WARNING:
    case SecurityDeviceStatus.MAINTENANCE:
      return "warning"
    case SecurityDeviceStatus.OFFLINE:
      return "critical"
    case SecurityDeviceStatus.UNCONFIGURED:
      return "info"
  }
}

function securityAlertStatusToLabel(status: SecurityAlertStatus) {
  switch (status) {
    case SecurityAlertStatus.Open:
      return "Open"
    case SecurityAlertStatus.Acknowledged:
      return "Acknowledged"
    case SecurityAlertStatus.Resolved:
      return "Resolved"
  }
}

function serviceTicketStatusToLabel(status: ServiceTicketStatus) {
  switch (status) {
    case ServiceTicketStatus.Open:
      return "Open"
    case ServiceTicketStatus.Scheduled:
      return "Scheduled"
    case ServiceTicketStatus.InProgress:
      return "In Progress"
    case ServiceTicketStatus.Resolved:
      return "Resolved"
    case ServiceTicketStatus.Closed:
      return "Closed"
  }
}

function serviceTicketStatusToTone(status: ServiceTicketStatus): PortalTone {
  switch (status) {
    case ServiceTicketStatus.Open:
    case ServiceTicketStatus.InProgress:
      return "warning"
    case ServiceTicketStatus.Scheduled:
      return "info"
    case ServiceTicketStatus.Resolved:
    case ServiceTicketStatus.Closed:
      return "healthy"
  }
}

function invoiceStatusToLabel(status: InvoiceStatus) {
  switch (status) {
    case InvoiceStatus.Draft:
      return "Draft"
    case InvoiceStatus.Open:
      return "Open"
    case InvoiceStatus.Paid:
      return "Paid"
    case InvoiceStatus.Overdue:
      return "Overdue"
    case InvoiceStatus.Void:
      return "Void"
  }
}

function invoiceStatusToTone(status: InvoiceStatus): PortalTone {
  switch (status) {
    case InvoiceStatus.Paid:
      return "healthy"
    case InvoiceStatus.Open:
    case InvoiceStatus.Draft:
      return "info"
    case InvoiceStatus.Overdue:
      return "critical"
    case InvoiceStatus.Void:
      return "warning"
  }
}

function documentCategoryToLabel(category: DocumentCategory) {
  switch (category) {
    case DocumentCategory.Operations:
      return "Operations"
    case DocumentCategory.Support:
      return "Support"
    case DocumentCategory.Commercial:
      return "Commercial"
    case DocumentCategory.Warranty:
      return "Warranty"
    case DocumentCategory.Other:
      return "Other"
  }
}

function deviceTypeToLabel(deviceType: SecurityDeviceType) {
  switch (deviceType) {
    case SecurityDeviceType.CAMERA:
      return "Camera"
    case SecurityDeviceType.DOOR_SENSOR:
      return "Door Sensor"
    case SecurityDeviceType.WINDOW_SENSOR:
      return "Window Sensor"
    case SecurityDeviceType.MOTION_SENSOR:
      return "Motion Sensor"
    case SecurityDeviceType.SMOKE_DETECTOR:
      return "Smoke Detector"
    case SecurityDeviceType.CO_DETECTOR:
      return "CO Detector"
    case SecurityDeviceType.LOCK:
      return "Smart Lock"
    case SecurityDeviceType.PANEL:
      return "Panel"
    case SecurityDeviceType.SIREN:
      return "Siren"
    case SecurityDeviceType.FLOOD_SENSOR:
      return "Flood Sensor"
    case SecurityDeviceType.OTHER:
      return "Other"
  }
}

function deviceStatusToLabel(status: SecurityDeviceStatus) {
  switch (status) {
    case SecurityDeviceStatus.UNCONFIGURED:
      return "Unconfigured"
    case SecurityDeviceStatus.ONLINE:
      return "Online"
    case SecurityDeviceStatus.WARNING:
      return "Warning"
    case SecurityDeviceStatus.OFFLINE:
      return "Offline"
    case SecurityDeviceStatus.MAINTENANCE:
      return "Maintenance"
  }
}

function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100)
}

function formatDateLabel(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value)
}

function formatTimeLabel(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(value)
}

function formatDateTimeLabel(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value)
}

function formatRelativeTimestamp(value: Date) {
  const seconds = Math.floor((Date.now() - value.getTime()) / 1000)

  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}