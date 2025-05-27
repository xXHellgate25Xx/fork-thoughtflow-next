import React from 'react';
import { Icon } from '@iconify/react';

interface ContentItemMetaProps {
  label: string;
  value: React.ReactNode;
  icon?: string;
}

export function ContentItemMeta({ label, value, icon }: ContentItemMetaProps) {
  return (
    <div className="mb-4">
      <div className="text-xs uppercase font-semibold mb-1 text-[#00396E]">
        {label}
      </div>
      <div className="text-base">{value}</div>
    </div>
  );
}

interface ContentItemStatusProps {
  isActive: boolean;
}

export function ContentItemStatus({ isActive }: ContentItemStatusProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
      isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      <span className={`mr-1.5 w-2 h-2 rounded-full ${
        isActive ? 'bg-green-600' : 'bg-gray-500'
      }`} />
      {isActive ? 'ACTIVE' : 'INACTIVE'}
    </span>
  );
}

interface ContentItemStatsProps {
  published: number;
  drafts: number; 
}

export function ContentItemStats({ published, drafts }: ContentItemStatsProps) {
  return (
    <div className="flex gap-4 mt-4">
      <div className="bg-[#E8F7FF] rounded-md flex items-center py-2.5 px-4">
        <Icon 
          icon="tabler:arrow-up" 
          className="w-5 h-5 text-[#00396E] mr-2.5" 
        />
        <span className="text-[#00396E] font-medium mr-1">Published:</span>
        <span className="text-[#00396E] font-medium">{published}</span>
      </div>
      
      <div className="bg-[#E8F7FF] rounded-md flex items-center py-2.5 px-4">
        <Icon 
          icon="mdi:file" 
          className="w-5 h-5 text-[#00396E] mr-2.5" 
        />
        <span className="text-[#00396E] font-medium mr-1">Draft:</span>
        <span className="text-[#00396E] font-medium">{drafts}</span>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export function ActionButton({ icon, onClick, children }: ActionButtonProps) {
  return (
    <button 
      type="button"
      className="p-2 rounded border-2 border-gray-300 hover:bg-gray-50 flex items-center"
      onClick={onClick}
    >
      <Icon icon={icon} className="h-5 w-5 text-[#00396E] mr-2" />
      <span>{children}</span>
    </button>
  );
} 