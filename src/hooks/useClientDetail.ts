import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useClientDetail(id: string) {
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Invoices');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const fetchClient = () => {
    fetch(`/api/clients/${id}`)
      .then(res => res.json())
      .then(data => {
        setClient(data);
        setFormData(data);
      })
      .catch(() => router.push('/clients'));
  };

  useEffect(() => { fetchClient(); }, [id, router]);

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) {
        toast.success("Client updated successfully");
        setIsEditOpen(false);
        fetchClient();
      } else {
        toast.error("Failed to update client");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  return { client, activeTab, setActiveTab, isEditOpen, setIsEditOpen, formData, setFormData, handleSaveEdit };
}
