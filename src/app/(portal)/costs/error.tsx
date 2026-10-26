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

export default function CostsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Costs failed to load", error);
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
            Costs unavailable
          </h1>
        </CardTitle>
        <CardDescription>
          We could not load cost data. Please try again.
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
