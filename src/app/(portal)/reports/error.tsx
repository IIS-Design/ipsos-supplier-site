"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ReportsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Reports failed to load", error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-2xl border-rose-200">
      <CardHeader>
        <CardTitle>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <AlertTriangle
              aria-hidden="true"
              className="size-5 text-rose-700"
            />
            Reports unavailable
          </h1>
        </CardTitle>
        <CardDescription>
          We could not load reports. Please try again.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={retry} type="button">
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}
