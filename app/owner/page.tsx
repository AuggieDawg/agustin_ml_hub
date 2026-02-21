// app/owner/page.tsx
//
// Owner Portal entry page (/owner)
//
// IMPORTANT:
// - components/owner/OwnerDashboard.tsx exports a DEFAULT export.
// - Therefore we must import it WITHOUT curly braces.

import OwnerDashboard from "@/components/owner/OwnerDashboard";

export default function OwnerPage() {
  return <OwnerDashboard />;
}
