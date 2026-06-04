"use client";

import { use } from "react";
import { format } from "date-fns";
import { ChevronRight, Loader2 } from "lucide-react";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { ProjectPLPanel } from "@/components/projects/ProjectPLPanel";
import { ProjectMilestones } from "@/components/projects/ProjectMilestones";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { project, profitabilityScore, router } = useProjectDetail(id);

  if (!project) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center text-sm text-neutral-400 mb-2">
            <span className="hover:text-neutral-200 cursor-pointer" onClick={() => router.push('/projects')}>Projects</span>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-neutral-200">{project.name}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
          <p className="text-neutral-400 mt-1">{project.client.name} • {format(new Date(project.createdAt), 'MMM d, yyyy')}</p>
        </div>
      </div>

      <ProjectPLPanel project={project} profitabilityScore={profitabilityScore} />
      <ProjectMilestones project={project} />
    </div>
  );
}

