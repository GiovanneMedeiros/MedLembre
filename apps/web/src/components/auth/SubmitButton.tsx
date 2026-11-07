import type { ComponentProps, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/Button";

type ButtonProps = ComponentProps<typeof Button>;

interface SubmitButtonProps {
  isLoading: boolean;
  children: ReactNode;
  loadingText?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}

export function SubmitButton({
  isLoading,
  children,
  loadingText = "Enviando...",
  variant = "primary",
  size = "lg",
}: SubmitButtonProps) {
  return (
    <Button type="submit" variant={variant} size={size} className="w-full" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
