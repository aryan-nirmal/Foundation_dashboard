import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./ui/button";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="w-full max-w-2xl rounded-2xl bg-white shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            aria-label="Close modal"
            className="h-10 w-10 rounded-full p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className={cn("px-6 py-5")}>{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

