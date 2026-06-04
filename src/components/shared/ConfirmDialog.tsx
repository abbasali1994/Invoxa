import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export interface ConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({ title, description, onConfirm, onCancel, isOpen, confirmText = "Confirm", cancelText = "Cancel" }: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <button onClick={onCancel} className="px-4 py-2 border border-neutral-700 rounded-md hover:bg-neutral-800 transition-colors">{cancelText}</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors text-white font-medium">{confirmText}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
