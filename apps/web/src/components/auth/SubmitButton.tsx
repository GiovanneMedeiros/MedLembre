import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/Button";

interface SubmitButtonProps {
  isLoading: boolean;
  children: ReactNode;
  loadingText?: string;
}

export function SubmitButton({ isLoading, children, loadingText = "Enviando..." }: SubmitButtonProps) {
  return (
    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
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
