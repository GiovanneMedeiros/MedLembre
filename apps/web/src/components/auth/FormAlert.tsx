import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/cn";

interface FormAlertProps {
  variant: "success" | "error";
  children: ReactNode;
}

export function FormAlert({ variant, children }: FormAlertProps) {
  const isSuccess = variant === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
        isSuccess ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700",
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span>{children}</span>
    </div>
  );
}
