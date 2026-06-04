"use client";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ChevronRight } from "lucide-react";
import { useClientDetail } from "@/hooks/useClientDetail";
import { ClientDetailHeader } from "@/components/clients/ClientDetailHeader";
import { ClientStatCards } from "@/components/clients/ClientStatCards";
import { ClientInvoicesTab } from "@/components/clients/ClientInvoicesTab";
import { ClientProjectsTab } from "@/components/clients/ClientProjectsTab";
import { ClientTransactionsTab } from "@/components/clients/ClientTransactionsTab";
import { ClientUpcomingTab } from "@/components/clients/ClientUpcomingTab";
import { ClientEditDrawer } from "@/components/clients/ClientEditDrawer";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { client, activeTab, setActiveTab, isEditOpen, setIsEditOpen, formData, setFormData, handleSaveEdit } = useClientDetail(id);

  if (!client) return <div className="flex h-[80vh] justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  const tabs = ['Invoices', 'Projects', 'Transactions', 'Upcoming'];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center text-sm text-neutral-400 mb-2">
        <span className="hover:text-neutral-200 cursor-pointer" onClick={() => router.push('/clients')}>Clients</span>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="text-neutral-200">{client.name}</span>
      </div>

      <ClientDetailHeader client={client} setIsEditOpen={setIsEditOpen} />
      <ClientStatCards client={client} />

      <div className="flex space-x-1 p-1 bg-neutral-900/80 rounded-lg w-max border border-neutral-800">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden min-h-[400px]">
        {activeTab === 'Invoices' && <ClientInvoicesTab client={client} />}
        {activeTab === 'Projects' && <ClientProjectsTab client={client} />}
        {activeTab === 'Transactions' && <ClientTransactionsTab client={client} />}
        {activeTab === 'Upcoming' && <ClientUpcomingTab client={client} />}
      </div>

      <ClientEditDrawer formData={formData} setFormData={setFormData} isEditOpen={isEditOpen} setIsEditOpen={setIsEditOpen} handleSaveEdit={handleSaveEdit} />
    </div>
  );
}
