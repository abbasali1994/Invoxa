import React from "react";
import { format } from "date-fns";
import { Plus, FolderOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/clients/StatusBadge";

export function ClientProjectsTab({ client }: { client: any }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <div className="p-4 border-b border-neutral-800 flex justify-end">
        <button className="flex items-center px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-md text-xs font-medium hover:bg-neutral-700 transition-colors text-white">
          <Plus className="w-3.5 h-3.5 mr-1" /> New Project
        </button>
      </div>
      {client.projects?.length > 0 ? (
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
            <tr>
              <th className="px-5 py-4 font-medium">Project Name</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Budget</th>
              <th className="px-5 py-4 font-medium">Start Date</th>
              <th className="px-5 py-4 font-medium">End Date</th>
              <th className="px-5 py-4 font-medium text-right">Profitability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {client.projects.map((proj: any) => (
              <tr key={proj.id} className="hover:bg-neutral-800/30 transition-colors cursor-pointer" onClick={() => router.push(`/projects/${proj.id}`)}>
                <td className="px-5 py-4 font-medium text-white">{proj.name}</td>
                <td className="px-5 py-4"><StatusBadge status={proj.status} /></td>
                <td className="px-5 py-4 text-neutral-300">{proj.budget ? `$${proj.budget.toLocaleString()}` : 'N/A'}</td>
                <td className="px-5 py-4 text-neutral-400">{proj.startDate ? format(new Date(proj.startDate), 'MMM d, yyyy') : 'N/A'}</td>
                <td className="px-5 py-4 text-neutral-400">{proj.endDate ? format(new Date(proj.endDate), 'MMM d, yyyy') : 'N/A'}</td>
                <td className="px-5 py-4 text-right text-emerald-400 font-medium">--%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
          <FolderOpen className="w-12 h-12 mb-4 opacity-20" />
          <p>No projects yet</p>
        </div>
      )}
    </div>
  );
}
