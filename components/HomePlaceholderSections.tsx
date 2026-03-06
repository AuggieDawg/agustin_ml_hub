export function HomePlaceholderSections() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      {Array.from({ length: 6 }).map((_, i) => (
        <section key={i} className="my-10 rounded-2xl border border-white/10 bg-black/30 p-6">
          <h3 className="text-lg font-semibold">Section {i + 1}</h3>
          <p className="mt-2 text-sm text-white/70">
            Placeholder content for scrolling. Replace with real copy later (features, pricing, case studies, FAQ, etc.).
          </p>
          <div className="mt-4 h-40 rounded-xl bg-white/5" />
        </section>
      ))}
    </div>
  );
}