"use client";

import React, { useRef, useState, useCallback } from "react";
import { UploadCloud, Loader2, FileText, Image } from "lucide-react";
import { useExpenseUpload } from "@/hooks/useExpenseUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function UploadExpenseButton() {
  const { isProcessing, processFile } = useExpenseUpload();
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setOpen(false);
      await processFile(file);
    },
    [processFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const accepted = file.type.startsWith("image/") || file.type === "application/pdf";
    if (!accepted) return;
    handleFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  return (
    <>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={onInputChange}
        className="hidden"
        ref={fileInputRef}
      />

      <button
        onClick={() => setOpen(true)}
        disabled={isProcessing}
        className="flex items-center px-4 py-2 border border-neutral-700 bg-neutral-900 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-400" />
        ) : (
          <UploadCloud className="w-4 h-4 mr-2 text-indigo-400" />
        )}
        {isProcessing ? "Scanning..." : "Upload Expense"}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Expense</DialogTitle>
            <DialogDescription>
              Drop a receipt or bill — we'll extract the details automatically.
            </DialogDescription>
          </DialogHeader>

          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`
              mt-2 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed
              px-8 py-12 text-center transition-colors cursor-default select-none
              ${isDragging
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-neutral-700 bg-neutral-800/40 hover:border-neutral-600 hover:bg-neutral-800/60"
              }
            `}
          >
            <div className="flex items-center gap-3 text-neutral-500">
              <FileText className="w-8 h-8" />
              <span className="text-2xl font-light text-neutral-600">/</span>
              <Image className="w-8 h-8" />
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-200">
                {isDragging ? "Release to upload" : "Drag & drop a file here"}
              </p>
              <p className="mt-1 text-xs text-neutral-500">PDF or image (JPG, PNG, WebP)</p>
            </div>

            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-neutral-700" />
              <span className="text-xs text-neutral-500">or</span>
              <div className="flex-1 h-px bg-neutral-700" />
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Browse files
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
