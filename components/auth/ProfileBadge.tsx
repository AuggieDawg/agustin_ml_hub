"use client";

/**
 * components/auth/ProfileBadge.tsx
 *
 * Minimal profile badge:
 * - Fetches session from /api/auth/session (NextAuth v4)
 * - Displays Google profile image + email when available
 *
 * Why this approach:
 * - Avoids adding SessionProvider complexity right now
 * - Still gives you a real "profile pic" UI element
 *
 * Later:
 * - Add a user-uploaded avatar stored in DB or object storage
 */

import { useEffect, useState } from "react";

type SessionUser = {
  email?: string | null;
  image?: string | null;
  name?: string | null;
};

type SessionResponse = {
  user?: SessionUser;
  expires?: string;
} | null;

export function ProfileBadge() {
  const [session, setSession] = useState<SessionResponse>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => setSession(data))
      .catch(() => setSession(null));
  }, []);

  const user = session?.user;
  if (!user?.email) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {user.image ? (
        <img
          src={user.image}
          alt="Profile"
          width={34}
          height={34}
          style={{ borderRadius: 999, border: "1px solid #ddd" }}
        />
      ) : (
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            border: "1px solid #ddd",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
          }}
        >
          ?
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span style={{ fontSize: 12, opacity: 0.7 }}>Signed in</span>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{user.email}</span>
      </div>
    </div>
  );
}
