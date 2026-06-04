import React from 'react';

export interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
}

export function LoadingSkeleton({ rows = 3, columns = 1 }: LoadingSkeletonProps) {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="h-12 bg-neutral-800 rounded-xl flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}
