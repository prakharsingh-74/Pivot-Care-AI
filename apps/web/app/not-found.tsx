import Link from "next/link";
import { Glitchy404 } from "@/components/ui/glitchy-404";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full bg-background flex flex-col items-center justify-center overflow-hidden gap-8 px-4">

      {/* Glitchy 404 heading */}
      <div className="flex items-center justify-center w-full max-w-3xl">
        <Glitchy404 width={860} height={232} color="currentColor" />
      </div>

      {/* Supporting text */}
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved. Let&apos;s get you back on track.
        </p>
      </div>

      {/* CTA buttons */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Go Home
        </Link>
        <Link
          href="/conversations"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
