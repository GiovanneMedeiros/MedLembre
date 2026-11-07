import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "../../lib/cn";

interface AccordionItem {
  question: string;
  answer: string;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="border-b-2 border-ink-900/10">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div key={item.question} className="border-t-2 border-ink-900/10">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left text-xl font-bold text-ink-900 transition-colors hover:text-brand-700"
              >
                {item.question}
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                    isOpen ? "rotate-45 bg-brand-600 text-white" : "bg-cha text-brand-700",
                  )}
                >
                  <Plus className="h-5 w-5" strokeWidth={2.5} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-7 pr-12 text-lg leading-relaxed text-ink-700">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
