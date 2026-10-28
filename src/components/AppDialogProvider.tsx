"use client";

import {
  CheckCircle2,
  Info,
  ShieldAlert,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui";

type DialogTone = "info" | "success" | "warning" | "danger";

type DialogOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: DialogTone;
};

type PromptOptions = DialogOptions & {
  label: string;
  placeholder?: string;
  initialValue?: string;
  minLength?: number;
  maxLength?: number;
};

type DialogRequest =
  | ({ kind: "alert" } & DialogOptions)
  | ({ kind: "confirm" } & DialogOptions)
  | ({ kind: "prompt" } & PromptOptions);

type DialogApi = {
  alert: (options: DialogOptions) => Promise<void>;
  confirm: (options: DialogOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
};

const DialogContext = createContext<DialogApi | null>(null);

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<DialogRequest | null>(null);
  const resolver = useRef<((value: unknown) => void) | null>(null);

  const open = useCallback(<T,>(nextRequest: DialogRequest) => {
    return new Promise<T>((resolve) => {
      resolver.current = resolve as (value: unknown) => void;
      setRequest(nextRequest);
    });
  }, []);

  const api = useMemo<DialogApi>(() => ({
    alert: (options) => open<void>({ kind: "alert", tone: "info", ...options }),
    confirm: (options) => open<boolean>({ kind: "confirm", tone: "warning", ...options }),
    prompt: (options) => open<string | null>({ kind: "prompt", tone: "info", ...options }),
  }), [open]);

  const complete = useCallback((value: unknown) => {
    const resolve = resolver.current;
    resolver.current = null;
    setRequest(null);
    resolve?.(value);
  }, []);

  return (
    <DialogContext.Provider value={api}>
      {children}
      {request && <AppDialog request={request} onComplete={complete} />}
    </DialogContext.Provider>
  );
}

export function useAppDialog() {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useAppDialog must be used inside AppDialogProvider");
  return context;
}

function AppDialog({
  request,
  onComplete,
}: {
  request: DialogRequest;
  onComplete: (value: unknown) => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(request.kind === "prompt" ? request.initialValue || "" : "");
  const [validationError, setValidationError] = useState("");
  const tone = request.tone || "info";
  const isPrompt = request.kind === "prompt";
  const canCancel = request.kind !== "alert";
  const toneStyles = {
    info: { icon: Info, iconClass: "bg-primary-soft text-primary" },
    success: { icon: CheckCircle2, iconClass: "bg-success-soft text-success" },
    warning: { icon: TriangleAlert, iconClass: "bg-warning-soft text-primary-darker" },
    danger: { icon: ShieldAlert, iconClass: "bg-danger-soft text-danger" },
  }[tone];
  const Icon = toneStyles.icon;

  const cancel = useCallback(() => {
    onComplete(request.kind === "confirm" ? false : request.kind === "prompt" ? null : undefined);
  }, [onComplete, request.kind]);

  const confirm = useCallback(() => {
    if (request.kind === "prompt") {
      const trimmed = value.trim();
      const minimum = request.minLength ?? 3;
      if (trimmed.length < minimum) {
        setValidationError(`Enter at least ${minimum} characters so the decision is clear.`);
        textAreaRef.current?.focus();
        return;
      }
      onComplete(trimmed);
      return;
    }
    onComplete(request.kind === "confirm" ? true : undefined);
  }, [onComplete, request, value]);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => {
      (isPrompt ? textAreaRef.current : primaryButtonRef.current)?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        cancel();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex='-1'])",
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previousFocus?.focus();
    };
  }, [cancel, isPrompt]);

  const dialog = (
    <div className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto bg-ink/60 p-4 sm:p-6" onMouseDown={(event) => {
      if (event.target === event.currentTarget && canCancel) cancel();
    }}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-lg rounded-3xl border border-line bg-surface p-5 shadow-lifted sm:p-7"
      >
        <div className="flex items-start gap-4">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${toneStyles.iconClass}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-xl font-black tracking-[-0.02em] text-ink">{request.title}</h2>
            <p id={descriptionId} className="mt-1.5 text-sm leading-6 text-body">{request.description}</p>
          </div>
          {canCancel && (
            <button type="button" onClick={cancel} aria-label="Close dialog" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-ink focus:outline-none focus:ring-4 focus:ring-primary/15">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {request.kind === "prompt" && (
          <div className="mt-6">
            <div className="flex items-end justify-between gap-3">
              <label htmlFor={`${titleId}-input`} className="text-sm font-bold text-ink">{request.label}</label>
              {request.maxLength && <span className="text-xs tabular-nums text-muted">{value.length}/{request.maxLength}</span>}
            </div>
            <textarea
              ref={textAreaRef}
              id={`${titleId}-input`}
              value={value}
              maxLength={request.maxLength}
              placeholder={request.placeholder}
              onChange={(event) => {
                setValue(event.target.value);
                if (validationError) setValidationError("");
              }}
              rows={4}
              className="mt-2 w-full resize-y rounded-2xl border border-line-strong bg-surface px-4 py-3 text-base leading-6 text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? `${titleId}-error` : undefined}
            />
            {validationError && <p id={`${titleId}-error`} role="alert" className="mt-2 text-sm font-medium text-danger">{validationError}</p>}
          </div>
        )}

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {canCancel && <Button type="button" variant="outline" onClick={cancel} className="min-h-11 sm:min-w-28">{request.cancelLabel || "Cancel"}</Button>}
          <Button ref={primaryButtonRef} type="button" onClick={confirm} className={`min-h-11 sm:min-w-32 ${tone === "danger" ? "bg-danger hover:bg-danger/90" : ""}`}>
            {request.confirmLabel || (request.kind === "alert" ? "Got it" : "Continue")}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
