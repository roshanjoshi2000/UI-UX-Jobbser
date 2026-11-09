import { PrototypeApp } from "@/components/PrototypeApp";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(73,18,255,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(10,8,63,0.08),_transparent_50%)]"
      />
      <div className="relative">
        <PrototypeApp />
      </div>
    </main>
  );
}
