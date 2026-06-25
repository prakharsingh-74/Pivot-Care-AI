"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

const defaultSignInContent = {
  quote: {
    text: "This platform has helped me save time and serve my clients faster than ever before.",
    author: "Pivot Care AI",
  },
};

const defaultSignUpContent = {
  quote: {
    text: "Join thousands of teams using AI to transform their customer care workflows.",
    author: "Pivot Care AI",
  },
};

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-slate-950 dark:text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isSignUp = pathname?.includes("sign-up");

  const currentContent = isSignUp ? defaultSignUpContent : defaultSignInContent;

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row overflow-hidden bg-background">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      {/* Auth Card/Form Column */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
        className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-6 bg-background z-10"
        style={{ order: isSignUp ? 2 : 1 }}
      >
        <div className="w-full max-w-md flex justify-center">{children}</div>
      </motion.div>

      {/* Showcase Column — FloatingPaths Animation */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
        className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col items-start justify-between p-10 h-screen bg-muted/60 border-r border-border"
        style={{ order: isSignUp ? 1 : 2 }}
      >
        {/* Bottom fade overlay (same as reference) */}
        <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent pointer-events-none" />

        {/* FloatingPaths SVG animation in background */}
        <div className="absolute inset-0 z-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>

        {/* Top branding */}
        <div className="relative z-20 flex items-center gap-2">
          <Image src="/icon.png" alt="Pivot Care AI Logo" width={40} height={40} />
          <span className="text-foreground font-bold text-lg tracking-tight">
            Pivot Care <span className="text-lime-400">AI</span>
          </span>
        </div>

        {/* Bottom glassmorphic quote card */}
        <div className="relative z-20 w-full">
          <blockquote className="space-y-2">
            <p className="text-xl text-foreground font-medium">
              &ldquo;{currentContent.quote.text}&rdquo;
            </p>
            <footer className="font-mono text-sm font-semibold text-muted-foreground">
              ~ {currentContent.quote.author}
            </footer>
          </blockquote>
        </div>
      </motion.div>
    </div>
  );
};