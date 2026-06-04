import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  variant?: 'default' | 'danger';
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
}

export function ActionMenu({ items }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        style={{
          background: 'transparent',
          border: 'none',
          padding: '8px',
          color: '#9ca3af',
          cursor: 'pointer'
        }}
      >
        <MoreHorizontal className="w-5 h-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-neutral-900 border-neutral-800 text-neutral-300">
        {items.map((item, i) => (
          <DropdownMenuItem 
            key={i} 
            onClick={(e) => { e.stopPropagation(); item.action(); }}
            className={`cursor-pointer hover:bg-neutral-800 ${item.variant === 'danger' ? 'text-rose-400 hover:text-rose-300' : ''}`}
          >
            {item.icon && <span className="mr-2 h-4 w-4">{item.icon}</span>}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
