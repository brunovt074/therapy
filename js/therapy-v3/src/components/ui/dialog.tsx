"use client";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

interface DialogContentProps extends RadixDialog.DialogContentProps {
  title?: string;
  description?: string;
}

export function DialogContent({
  title,
  description,
  children,
  className,
  ...props
}: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
      <RadixDialog.Content
        className={cn(
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
          "w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-auto",
          "bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          {title ? (
            <RadixDialog.Title className="font-medium text-[var(--text-primary)]">
              {title}
            </RadixDialog.Title>
          ) : (
            <div />
          )}
          <RadixDialog.Close className="p-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-4 h-4" />
          </RadixDialog.Close>
        </div>
        {description && (
          <RadixDialog.Description className="sr-only">
            {description}
          </RadixDialog.Description>
        )}
        <div className="p-4">{children}</div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

interface SheetContentProps extends RadixDialog.DialogContentProps {
  title?: string;
}

export function SheetContent({
  title,
  children,
  className,
  ...props
}: SheetContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
      <RadixDialog.Content
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-[var(--bg-secondary)] border-t border-[var(--border-color)] rounded-t-xl p-4 pb-8",
          className
        )}
        {...props}
      >
        <div className="w-10 h-1 bg-[var(--border-color)] rounded-full mx-auto mb-5" />
        {title && (
          <RadixDialog.Title className="sr-only">{title}</RadixDialog.Title>
        )}
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
