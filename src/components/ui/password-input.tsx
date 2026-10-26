"use client";

import { useId, useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type"> & {
  visibilityLabel?: string;
};

export function PasswordInput({
  id,
  className,
  disabled,
  visibilityLabel = "password",
  ...props
}: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        className={cn("pr-12", className)}
        disabled={disabled}
        id={inputId}
        type={visible ? "text" : "password"}
      />
      <Button
        aria-controls={inputId}
        aria-label={`${visible ? "Hide" : "Show"} ${visibilityLabel}`}
        aria-pressed={visible}
        className="absolute right-0 top-0 h-full w-11 px-0 text-muted-foreground"
        disabled={disabled}
        onClick={() => setVisible((current) => !current)}
        type="button"
        variant="ghost"
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="size-4" />
        ) : (
          <Eye aria-hidden="true" className="size-4" />
        )}
      </Button>
    </div>
  );
}
