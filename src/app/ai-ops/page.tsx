"use client";

import { useAIOps } from "@/hooks/useAIOps";
import { ReceiptOCRPanel } from "@/components/ai-ops/ReceiptOCRPanel";
import { AIProcessingQueue } from "@/components/ai-ops/AIProcessingQueue";

export default function AIOpsPage() {
  const aiOpsProps = useAIOps();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Operations Center</h2>
        <p className="text-neutral-400">Manage OCR extractions, smart categorization, and AI jobs.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ReceiptOCRPanel {...aiOpsProps} />
        <AIProcessingQueue isProcessing={aiOpsProps.isProcessing} />
      </div>
    </div>
  );
}

