import React, { useState } from 'react';
import { useFormContext } from "react-hook-form";

export interface ClientSelectorProps {
  clients: any[];
}

export function ClientSelector({ clients }: ClientSelectorProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  const watchClientName = watch("clientName") || "";
  const normalizedClientName = watchClientName.trim().toLowerCase();
  const exactClientMatches = clients.filter(c => c.name?.trim().toLowerCase() === normalizedClientName);
  const filteredClients = normalizedClientName
    ? (exactClientMatches.length > 0
        ? exactClientMatches
        : clients.filter(c => c.name?.toLowerCase().includes(normalizedClientName)))
    : clients;

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-1">Bill To (Client)</label>
      <input type="hidden" {...register("clientId")} />
      <div className="relative">
        <input
          type="text"
          {...register("clientName")}
          placeholder="Client name"
          autoComplete="off"
          onFocus={() => setIsClientDropdownOpen(true)}
          onChange={(event) => {
            const value = event.target.value;
            setValue("clientName", value, { shouldValidate: true, shouldDirty: true });
            const matchedClient = clients.find(c => c.name?.trim().toLowerCase() === value.trim().toLowerCase());
            setValue("clientId", matchedClient?.id || "");
            setIsClientDropdownOpen(true);
          }}
          onBlur={() => window.setTimeout(() => setIsClientDropdownOpen(false), 120)}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
        />
        {isClientDropdownOpen && clients.length > 0 && filteredClients.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-md border border-neutral-800 bg-neutral-950 shadow-xl">
            {filteredClients.map(c => (
              <button
                key={c.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setValue("clientId", c.id, { shouldValidate: true, shouldDirty: true });
                  setValue("clientName", c.name, { shouldValidate: true, shouldDirty: true });
                  setIsClientDropdownOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>
      {errors.clientName && <p className="text-rose-500 text-xs mt-1">{String(errors.clientName.message)}</p>}
    </div>
  );
}
