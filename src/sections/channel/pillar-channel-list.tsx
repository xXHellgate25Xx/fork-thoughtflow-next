import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { MOCK_CHANNELS } from 'src/mocks/channel-data';
import { channelIcons } from 'src/theme/icons/channel-icons';
import { ChannelData, useGetChannelsByPillarIdQuery, useModifyChannelMutation } from 'src/libs/service/channel/channel';
import { AddChannelModal } from 'src/components/modal/add-channel-modal';
import { EditChannelModal } from 'src/components/modal/edit-channel-modal';
import { ChannelCard } from './channel-card';

interface PillarChannelListProps {
  pillarId?: string;
}

export function PillarChannelList({ pillarId }: PillarChannelListProps) {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [isAddChannelModalOpen, setIsAddChannelModalOpen] = useState(false);
  const [isEditChannelModalOpen, setIsEditChannelModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null);
  
  // Get real channels from API if a pillarId is provided
  const {
    data: channelsData,
    isLoading: getChannelsIsLoading,
    refetch: refetchChannels,
  } = useGetChannelsByPillarIdQuery(
    { pillar_id: pillarId || '' },
    { skip: !pillarId }
  );

  // Sort channels by active status first, then alphabetically by name
  const sortChannels = (channelsToSort: ChannelData[]) => 
    [...channelsToSort].sort((a, b) => {
      // First sort by active status (active channels first)
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1;
      }
      // Then sort by name alphabetically
      return a.name.localeCompare(b.name);
    });

  useEffect(() => {
    // If we have a pillarId and data from the API, use that
    if (pillarId && channelsData?.data) {
      console.log('Received channel data from API:', channelsData.data);
      setChannels(sortChannels(channelsData.data));
    } else {
      // Otherwise use mock data, filtering by pillarId if provided
      const filteredChannels = pillarId 
        ? MOCK_CHANNELS.filter(channel => channel.pillar_id === pillarId)
        : MOCK_CHANNELS;
      setChannels(sortChannels(filteredChannels));
    }
  }, [pillarId, channelsData]);
  
  // Log channel data when it changes
  useEffect(() => {
    if (channels.length > 0) {
      console.log('Current channels state:', channels);
    }
  }, [channels]);
  
  const handleChannelClick = (channelId: string, isPendingConnection?: boolean) => {
    if (isPendingConnection) {
      // Handle connecting a pending channel
      setIsAddChannelModalOpen(true);
      // We could pre-populate the prompt field with the existing prompt data
    } else {
      const channel = channels.find(c => c.id === channelId);
      if (channel) {
        setSelectedChannel(channel);
        setIsEditChannelModalOpen(true);
      }
    }
  };
  
  const handleAddChannelClick = () => {
    setIsAddChannelModalOpen(true);
  };
  
  const handleChannelAdded = (newChannel: ChannelData) => {
    // Add the new channel and sort the list
    console.log('Channel added:', newChannel);
    
    // Make sure the channel has all required properties for display
    const completeChannel: ChannelData = {
      ...newChannel,
      type: newChannel.type || newChannel.channel_type || 'unknown',
      // Ensure other required properties exist
      n_published: newChannel.n_published || 0,
      n_draft: newChannel.n_draft || 0,
      views: newChannel.views || 0
    };
    
    setChannels(sortChannels([...channels, completeChannel]));
    
    // Also refetch to ensure server data is synced
    console.log('Channel added, refreshing channel list');
    refetchChannels();
  };

  const handleChannelEdited = (updatedChannel: ChannelData) => {
    // Update the channel in the list and maintain sorted order
    const updatedChannels = channels.map(ch => 
      ch.id === updatedChannel.id ? updatedChannel : ch
    );
    setChannels(sortChannels(updatedChannels));
    
    // Also refetch to ensure server-side changes are reflected
    refetchChannels();
    setSelectedChannel(null);
  };

  // Handle status changes (active/inactive)
  const handleChannelStatusChange = (updatedChannel: ChannelData) => {
    // Update channel status and maintain sorted order
    const updatedChannels = channels.map(ch => 
      ch.id === updatedChannel.id ? updatedChannel : ch
    );
    setChannels(sortChannels(updatedChannels));
    
    // Refetch to sync with server
    refetchChannels();
  };
  
  // Handle channel deletion
  const handleChannelDelete = (deletedChannelId: string) => {
    // Remove the channel from the list
    const updatedChannels = channels.filter(ch => ch.id !== deletedChannelId);
    setChannels(updatedChannels);
    
    // Refetch to sync with server
    refetchChannels();
  };
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-primary">Channels</h2>
        <div className="flex items-center">
          <button
            type="button"
            className="px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2 hover:bg-primary/80 transition-colors"
            onClick={handleAddChannelClick}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 4v16m-8-8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Add Channel</span>
          </button>
        </div>
      </div>
      
      {getChannelsIsLoading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
          <p className="ml-3">Loading channels...</p>
        </div>
      ) : channels.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No channels found for this pillar</p>
            <button
              type="button"
              className="px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2 hover:bg-primary/80 transition-colors mx-auto"
              onClick={handleAddChannelClick}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 4v16m-8-8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Add First Channel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {channels.map(channel => (
            <ChannelCard 
              key={channel.id} 
              channel={channel} 
              onClick={() => handleChannelClick(channel.id, (channel as any).pending_connection)}
              onEditClick={() => {
                setSelectedChannel(channel);
                setIsEditChannelModalOpen(true);
              }}
              onStatusChange={handleChannelStatusChange}
              onDelete={handleChannelDelete}
            />
          ))}
        </div>
      )}
      
      {/* Add Channel Modal */}
      {pillarId && (
        <AddChannelModal
          isOpen={isAddChannelModalOpen}
          onClose={() => setIsAddChannelModalOpen(false)}
          pillarId={pillarId}
          onSuccess={handleChannelAdded}
        />
      )}

      {/* Edit Channel Modal */}
      {selectedChannel && (
        <EditChannelModal
          isOpen={isEditChannelModalOpen}
          onClose={() => {
            setIsEditChannelModalOpen(false);
            setSelectedChannel(null);
          }}
          channel={selectedChannel}
          onSuccess={handleChannelEdited}
        />
      )}
    </div>
  );
} 