export type Tone = "healthy" | "warning" | "critical" | "info"

export type SecurityMetric = {
  label: string
  value: string
  helper: string
  tone: Tone
}

export type SecurityAlert = {
  title: string
  time: string
  zone: string
  severity: Tone
  detail: string
}

export type SecurityEvent = {
  time: string
  title: string
  detail: string
  actor: string
}

export type CameraFeed = {
  id: string
  label: string
  location: string
  tone: Tone
  summary: string
}

export type PropertyZone = {
  name: string
  sensors: number
  cameras: number
  locks: number
  status: string
  tone: Tone
  note: string
}

export type DeviceRecord = {
  name: string
  type: string
  location: string
  lastSeen: string
  firmware: string
  status: string
  tone: Tone
}

export type ServiceTicket = {
  id: string
  title: string
  priority: string
  status: string
  tone: Tone
  openedAt: string
  owner: string
}

export type InvoiceRecord = {
  id: string
  amount: string
  dueDate: string
  status: string
  tone: Tone
}

export type DocumentRecord = {
  name: string
  category: string
  updatedAt: string
  access: string
  summary: string
}

export const overviewMetrics: SecurityMetric[] = [
  {
    label: "System Status",
    value: "Armed Away",
    helper: "Primary perimeter is armed",
    tone: "warning",
  },
  {
    label: "System Health",
    value: "All Systems Normal",
    helper: "Core devices are reporting",
    tone: "healthy",
  },
  {
    label: "Active Alerts",
    value: "3",
    helper: "Needs operator review",
    tone: "critical",
  },
  {
    label: "Devices Online",
    value: "9",
    helper: "Live monitored devices",
    tone: "info",
  },
]

export const alerts: SecurityAlert[] = [
  {
    title: "Front Door Opened",
    time: "8:14 PM",
    zone: "Front Entry",
    severity: "critical",
    detail: "Front entry contact reported an open event while armed.",
  },
  {
    title: "Motion Detected",
    time: "8:15 PM",
    zone: "Living Room",
    severity: "warning",
    detail: "Interior motion sensor detected movement within the monitored schedule.",
  },
  {
    title: "Garage Camera Reconnected",
    time: "7:58 PM",
    zone: "Garage",
    severity: "info",
    detail: "Camera restored connectivity after a brief network interruption.",
  },
]

export const eventHistory: SecurityEvent[] = [
  {
    time: "08:16 PM",
    title: "Motion Detected",
    detail: "Living room sensor reported movement and generated an alert.",
    actor: "System",
  },
  {
    time: "08:03 PM",
    title: "Back Door Opened",
    detail: "Back door contact opened and closed normally.",
    actor: "System",
  },
  {
    time: "07:45 PM",
    title: "Camera Offline",
    detail: "Garage camera heartbeat missed for two minutes before recovery.",
    actor: "Network monitor",
  },
]

export const cameraFeeds: CameraFeed[] = [
  {
    id: "cam-front-door",
    label: "Front Door",
    location: "Entry camera • Exterior",
    tone: "healthy",
    summary: "Primary front entry coverage with event-ready placement.",
  },
  {
    id: "cam-living-room",
    label: "Living Room",
    location: "Interior camera • Main area",
    tone: "info",
    summary: "Interior overview camera with privacy schedule planned.",
  },
]

export const propertyZones: PropertyZone[] = [
  {
    name: "Front Entry",
    sensors: 3,
    cameras: 1,
    locks: 1,
    status: "Covered",
    tone: "healthy",
    note: "Primary entry with contact, motion, and camera coverage.",
  },
  {
    name: "Living Room",
    sensors: 2,
    cameras: 1,
    locks: 0,
    status: "Monitored",
    tone: "info",
    note: "Interior movement visibility and central motion detection.",
  },
  {
    name: "Garage",
    sensors: 2,
    cameras: 1,
    locks: 0,
    status: "Needs Review",
    tone: "warning",
    note: "Connectivity recovered, but this zone needs hardened networking.",
  },
  {
    name: "Backyard",
    sensors: 1,
    cameras: 1,
    locks: 0,
    status: "Covered",
    tone: "healthy",
    note: "Exterior perimeter observation and rear access awareness.",
  },
]

export const devices: DeviceRecord[] = [
  {
    name: "Front Door Camera",
    type: "Camera",
    location: "Front Entry",
    lastSeen: "10 sec ago",
    firmware: "FW 2.3.1",
    status: "Online",
    tone: "healthy",
  },
  {
    name: "Living Room Camera",
    type: "Camera",
    location: "Living Room",
    lastSeen: "18 sec ago",
    firmware: "FW 2.3.1",
    status: "Online",
    tone: "healthy",
  },
  {
    name: "Garage Camera",
    type: "Camera",
    location: "Garage",
    lastSeen: "2 min ago",
    firmware: "FW 2.2.9",
    status: "Recovered",
    tone: "warning",
  },
  {
    name: "Front Door Contact",
    type: "Door Sensor",
    location: "Front Entry",
    lastSeen: "5 sec ago",
    firmware: "SEN 1.8.4",
    status: "Online",
    tone: "healthy",
  },
  {
    name: "Hall Motion Sensor",
    type: "Motion Sensor",
    location: "Living Room",
    lastSeen: "9 sec ago",
    firmware: "SEN 1.8.4",
    status: "Active",
    tone: "healthy",
  },
  {
    name: "Smoke Detector",
    type: "Safety Sensor",
    location: "Hallway",
    lastSeen: "28 sec ago",
    firmware: "SAFE 4.0.2",
    status: "Battery Low",
    tone: "warning",
  },
]

export const serviceTickets: ServiceTicket[] = [
  {
    id: "SR-1042",
    title: "Investigate garage camera stability",
    priority: "High",
    status: "Open",
    tone: "warning",
    openedAt: "today",
    owner: "Field Ops",
  },
  {
    id: "SR-1038",
    title: "Quarterly device health review",
    priority: "Normal",
    status: "Scheduled",
    tone: "info",
    openedAt: "yesterday",
    owner: "Support",
  },
]

export const invoices: InvoiceRecord[] = [
  {
    id: "INV-23014",
    amount: "$120.00",
    dueDate: "March 18, 2026",
    status: "Open",
    tone: "warning",
  },
  {
    id: "INV-22981",
    amount: "$89.00",
    dueDate: "February 18, 2026",
    status: "Paid",
    tone: "healthy",
  },
]

export const documents: DocumentRecord[] = [
  {
    name: "Installation Summary",
    category: "Operations",
    updatedAt: "Today",
    access: "Client access",
    summary: "Initial system install notes, mounted hardware, and service references.",
  },
  {
    name: "Warranty Packet",
    category: "Support",
    updatedAt: "Yesterday",
    access: "Client access",
    summary: "Warranty terms and equipment coverage references for installed devices.",
  },
  {
    name: "Service Agreement",
    category: "Commercial",
    updatedAt: "March 6, 2026",
    access: "Client access",
    summary: "Current monitored plan details, support expectations, and response scope.",
  },
]