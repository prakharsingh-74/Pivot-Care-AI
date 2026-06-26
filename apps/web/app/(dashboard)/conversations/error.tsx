"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConversationsError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Catch any Convex query ArgumentValidationErrors and redirect to 404
    if (
      error?.message?.includes("ArgumentValidationError") ||
      error?.message?.includes("does not match validator") ||
      error?.message?.includes("Server Error")
    ) {
      router.replace("/not-found");
    }
  }, [error, router]);

  return null;
}
