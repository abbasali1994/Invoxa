import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useProjectDetail(id: string) {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    setProject({
      id: id,
      name: "Acme Website Redesign",
      budget: 50000,
      currency: "USD",
      status: "ACTIVE",
      client: { name: "Acme Corp" },
      createdAt: new Date().toISOString(),
      milestones: [
        { id: "1", title: "Design Phase", amount: 15000, status: "PAID" },
        { id: "2", title: "Development Phase", amount: 25000, status: "INVOICED" },
        { id: "3", title: "Launch", amount: 10000, status: "PENDING" },
      ]
    });
  }, [id]);

  const profitabilityScore = 78;

  return { router, project, profitabilityScore };
}
