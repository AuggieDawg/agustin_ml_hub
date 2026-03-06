"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

type MapBox = { id: string; title: string; body: string; order: number };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function MapBoxes() {
  const [boxes, setBoxes] = useState<MapBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api<{ boxes: MapBox[] }>("/api/map-boxes");
        if (alive) setBoxes(data.boxes);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const sorted = useMemo(
    () => [...boxes].sort((a, b) => a.order - b.order),
    [boxes]
  );

  function addBox() {
    startTransition(async () => {
      const created = await api<{ box: MapBox }>("/api/map-boxes", {
        method: "POST",
        body: JSON.stringify({ title: "New Box", body: "Edit me…" }),
      });
      setBoxes((prev) => [...prev, created.box]);
    });
  }

  function saveBox(id: string, patch: Partial<Pick<MapBox, "title" | "body">>) {
    startTransition(async () => {
      const updated = await api<{ box: MapBox }>(`/api/map-boxes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setBoxes((prev) => prev.map((b) => (b.id === id ? updated.box : b)));
    });
  }

  function deleteBox(id: string) {
    startTransition(async () => {
      await api(`/api/map-boxes/${id}`, { method: "DELETE" });
      setBoxes((prev) => prev.filter((b) => b.id !== id));
    });
  }

  if (loading) return <div className="p-4 text-sm text-white/70">Loading…</div>;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Map Boxes</h2>
        <button
          onClick={addBox}
          disabled={isPending}
          className="rounded-md bg-white/10 px-3 py-1 text-sm hover:bg-white/15 disabled:opacity-60"
        >
          + Add box
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((b) => (
          <div key={b.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
            <input
              className="w-full rounded-md bg-white/5 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-white/20"
              defaultValue={b.title}
              onBlur={(e) => saveBox(b.id, { title: e.target.value })}
            />
            <textarea
              className="mt-3 h-28 w-full resize-none rounded-md bg-white/5 p-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
              defaultValue={b.body}
              onBlur={(e) => saveBox(b.id, { body: e.target.value })}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => deleteBox(b.id)}
                disabled={isPending}
                className="rounded-md bg-red-500/15 px-3 py-1 text-xs hover:bg-red-500/25 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}