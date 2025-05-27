import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';

import { channelIcons } from 'src/theme/icons/channel-icons';
import { useGetPillarChannelCountQuery } from 'src/libs/service/channel/channel';
import { ContentStatsBadges } from 'src/components/content/content-stats-badges';

// ----------------------------------------------------------------------

export type PillarItem = {
  id: string;
  name: string;
  is_active?: boolean;
  description?: string;
  primary_keyword?: string;
  n_published?: number;
  n_draft?: number;
  content_views?: number;
  channels?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
};

export function PillarCardItem({ product, onClick }: { product: PillarItem, onClick?: () => void }) {
  const { data: channelCountData } = useGetPillarChannelCountQuery({ pillar_id: product.id });
  const [channelCount, setChannelCount] = useState<number>(product.channels?.length || 0);
  
  useEffect(() => {
    if (channelCountData && typeof channelCountData.count === 'number') {
      setChannelCount(channelCountData.count);
    }
  }, [channelCountData]);

  // Truncate description to a fixed length for display
  const getShortDescription = (text?: string): string => {
    if (!text) return '-';
    return text.length > 120 ? `${text.substring(0, 120)}...` : text;
  };

  return (
    <button 
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow h-full flex flex-col w-full text-left"
      onClick={onClick}
      type="button"
    >
      <div className="p-5 flex-grow flex flex-col">
        {/* Header: Title and status */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold truncate max-w-[70%]">{product.name}</h3>
          <div className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
            product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            <span className={`mr-1.5 w-1.5 h-1.5 rounded-full ${
              product.is_active ? 'bg-green-600' : 'bg-gray-500'
            }`} />
            {product.is_active ? 'ACTIVE' : 'INACTIVE'}
          </div>
        </div>
        
        {/* Content details section - with consistent heights */}
        <div className="grid grid-cols-1 gap-2 mb-auto">
          <div className="flex items-start h-6">
            <span className="text-xs font-bold text-[#00396E] uppercase w-24 flex-shrink-0">KEYWORD</span>
            <span className="text-xs text-gray-900 truncate">{product.primary_keyword || '-'}</span>
          </div>
          
          <div className="flex items-start">
            <span className="text-xs font-bold text-[#00396E] uppercase w-24 flex-shrink-0">DESCRIPT.</span>
            <span className="text-xs text-gray-900 line-clamp-3 min-h-[3.6em]">{getShortDescription(product.description)}</span>
          </div>
          
          <div className="flex items-start h-6">
            <span className="text-xs font-bold text-[#00396E] uppercase w-24 flex-shrink-0">CHANNELS</span>
            <span className="text-xs text-gray-900">{channelCount}</span>
          </div>
        </div>
        
        {/* Views count */}
        <div className="flex items-center mt-3">
          <Icon icon="mdi:eye-outline" className="w-4 h-4 text-gray-500 mr-1.5" />
          <span className="text-xs text-gray-500">{product.content_views || 0}</span>
        </div>
      </div>
      
      {/* Stats at the bottom */}
      <div className="px-5 pb-5 pt-1">
        <ContentStatsBadges 
          published={product.n_published || 0} 
          drafts={product.n_draft || 0} 
        />
      </div>
    </button>
  );
}
