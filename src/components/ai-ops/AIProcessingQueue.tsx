import React from "react";
import { Bot } from "lucide-react";

export function AIProcessingQueue({ isProcessing }: { isProcessing: boolean }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
      <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          Processing Queue
        </h3>
        <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">{isProcessing ? "1 Active" : "Idle"}</span>
      </div>
      <div className="p-0 flex-1">
        <div className="divide-y divide-neutral-800">
          {isProcessing && (
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-400">OCR Extraction & Structuring</p>
                <p className="text-xs text-neutral-500">Tesseract.js + Claude AI Processing</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
            </div>
          )}
          <div className="p-4 flex items-center justify-between opacity-50">
            <div>
              <p className="text-sm font-medium">Anomaly Detection Scan</p>
              <p className="text-xs text-neutral-500">Completed 10 mins ago</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
