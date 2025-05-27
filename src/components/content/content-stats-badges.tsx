import { Icon } from '@iconify/react';

interface ContentStatsBadgesProps {
  published: number;
  drafts: number;
}

export function ContentStatsBadges({ published, drafts }: ContentStatsBadgesProps) {
  return (
    <div className="flex gap-4">
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