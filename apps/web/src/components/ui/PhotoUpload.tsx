import { useRef, useState } from "react";
import { Camera, ImageIcon, Loader2, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/cn";

interface PhotoUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket: string;
  shape?: "circle" | "square";
  fallbackIcon?: React.ReactNode;
}

const MAX_SIZE_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function PhotoUpload({ value, onChange, bucket, shape = "circle", fallbackIcon }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Envie uma imagem PNG, JPEG ou WEBP.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("A imagem deve ter no máximo 3MB.");
      return;
    }

    setIsUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada. Faça login novamente.");

      const extension = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar a foto.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-brand-50 text-brand-400",
          shape === "circle" ? "rounded-full" : "rounded-2xl",
        )}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          (fallbackIcon ?? <ImageIcon className="h-7 w-7" aria-hidden="true" />)
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-900/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-900/10 px-3.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5" aria-hidden="true" />
            {value ? "Trocar foto" : "Adicionar foto"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={isUploading}
              aria-label="Remover foto"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-300 hover:bg-ink-900/[0.04] hover:text-red-600 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
