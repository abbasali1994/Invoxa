import React from "react";
import { CheckCircle2 } from "lucide-react";

export function ProjectMilestones({ project }: { project: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50">
        <div className="p-5 border-b border-neutral-800 flex justify-between items-center">
          <h3 className="font-medium text-neutral-200">Milestones</h3>
          <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300">Add Milestone</button>
        </div>
        <div className="divide-y divide-neutral-800">
          {project.milestones.map((m: any) => (
            <div key={m.id} className="p-5 flex justify-between items-center hover:bg-neutral-800/20">
              <div className="flex items-center gap-3">
                {m.status === 'PAID' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-neutral-600"></div>}
                <div>
                  <p className="font-medium text-sm text-neutral-200">{m.title}</p>
                  <p className="text-xs text-neutral-500">${m.amount.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                  m.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 
                  m.status === 'INVOICED' ? 'bg-blue-500/10 text-blue-400' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
