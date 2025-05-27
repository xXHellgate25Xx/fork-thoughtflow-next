import { Icon } from '@iconify/react';
import { useState } from 'react';

import { channelIcons } from 'src/theme/icons/channel-icons';
import { 
  ChannelData, 
  useModifyChannelMutation,
  useUpdatePillarChannelPromptMutation,
  useDeletePillarChannelMutation
} from 'src/libs/service/channel/channel';
import { DeleteConfirmationModal } from 'src/components/modal/delete-confirmation-modal';

interface ChannelCardProps {
  channel: ChannelData;
  onClick?: () => void;
  onEditClick?: () => void;
  onStatusChange?: (updatedChannel: ChannelData) => void;
  onDelete?: (channelId: string) => void;
}

export function ChannelCard({ channel, onClick, onEditClick, onStatusChange, onDelete }: ChannelCardProps) {
  const isPendingConnection = !!(channel as any).pending_connection;
  const [modifyChannel] = useModifyChannelMutation();
  const [updatePillarChannelPrompt] = useUpdatePillarChannelPromptMutation();
  const [deletePillarChannel] = useDeletePillarChannelMutation();
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  const handleArchiveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setIsArchiving(true);
      
      // Make sure we have the required fields
      if (!channel.id || !channel.name) {
        console.error('Missing required channel fields');
        return;
      }
      
      console.log('Toggling channel association status with data:', {
        id: channel.id,
        name: channel.name,
        is_active: !channel.is_active,
        pillar_id: channel.pillar_id
      });
      
      // Use the appropriate API call based on whether this is an association toggle or channel toggle
      if (channel.pillar_id) {
        // If we have a pillar_id, we're dealing with a pillar-channel association
        // Get the existing prompt if available
        const prompt = channel.prompt || '';
        
        console.log('Using new API endpoint format for toggling pillar-channel status');
        
        // Use the association_id if available, otherwise fall back to channel.id
        const associationId = channel.association_id || channel.id;
        
        console.log('Using association ID for update:', associationId);
        
        // Call the pillar-channel association API to toggle the association status using the new API format
        await updatePillarChannelPrompt({
          pillar_id: channel.pillar_id,
          channel_id: channel.id, // Keep channel_id for backward compatibility
          prompt,
          // Include association_id in the payload
          payload: {
            id: channel.id,
            name: channel.name,
            is_active: !channel.is_active,
            association_id: associationId // Pass the association ID in the payload
          }
        }).unwrap();
      } else {
        // Regular channel update if no pillar_id is available
        // Create a payload with only the fields allowed to be updated
        const updatePayload: any = {
          name: channel.name,
          url: channel.url || '',
          is_active: !channel.is_active
        };
        
        // Call the API with the custom payload
        await modifyChannel({
          channel_id: channel.id,
          payload: updatePayload as any
        }).unwrap();
      }
      
      // Create updated channel with toggled status
      const updatedChannel: ChannelData = {
        ...channel,
        is_active: !channel.is_active
      };
      
      // Notify parent component about the status change
      if (onStatusChange) {
        onStatusChange(updatedChannel);
      }
      
    } catch (error) {
      console.error('Error toggling channel status:', error);
    } finally {
      setIsArchiving(false);
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirmation(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Make sure we have the required fields
      if (!channel.id) {
        console.error('Missing required channel id');
        setShowDeleteConfirmation(false);
        return;
      }
      
      // Use the association_id if available, otherwise fall back to channel.id
      const associationId = channel.association_id || channel.id;
      
      console.log('Deleting pillar-channel association with ID:', associationId);
      
      // Call the delete API
      await deletePillarChannel(associationId).unwrap();
      
      // Notify parent component about the deletion
      if (onDelete) {
        onDelete(channel.id);
      }
      
    } catch (error) {
      console.error('Error deleting channel:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };
  
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };
  
  return (
    <>
      <button 
        className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-100 cursor-pointer w-full text-left"
        onClick={onClick}
        type="button"
      >
        <div className="p-5">
          <div className="flex items-center">
            {/* Left section with channel info */}
            <div className="flex flex-col space-y-3 flex-grow">
              {/* Channel icon and name with status */}
              <div className="flex items-center">
                <div className={`w-14 h-10 flex items-center justify-center ${isPendingConnection ? 'bg-yellow-50' : 'bg-white'} rounded-md mr-4 flex-shrink-0 ${!isPendingConnection && 'border border-gray-200'}`}>
                  {isPendingConnection ? (
                    <Icon 
                      icon="mdi:connection"
                      className="h-5 w-5 text-primary" 
                    />
                  ) : (
                    <Icon 
                      icon={channelIcons[String(channel.type).toLowerCase()] || 'mdi:web'} 
                      className="h-5 w-5 text-primary" 
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <h3 className="text-base font-semibold text-gray-900 mr-2">{channel.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                      isPendingConnection ? 'bg-yellow-100 text-yellow-800' : 
                      channel.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <span className={`mr-1 w-1.5 h-1.5 rounded-full ${
                        isPendingConnection ? 'bg-yellow-600' : 
                        channel.is_active ? 'bg-green-600' : 'bg-gray-500'
                      }`} />
                      {isPendingConnection ? 'PENDING' : channel.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* URL information */}
              {channel.url && (
                <div className="flex items-center">
                  <div className="text-xs uppercase font-semibold w-16 flex-shrink-0 text-primary">URL</div>
                  <a 
                    href={`https://${channel.url}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-gray-700 hover:underline flex items-center gap-1 truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {channel.url}
                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-primary" viewBox="0 0 24 24" fill="none">
                      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              )}
              
              {/* Prompt information */}
              {((channel as any).prompt || channel.brand_voice_initial) && (
                <div className="flex items-start">
                  <div className="text-xs uppercase font-semibold w-16 flex-shrink-0 pt-1 text-primary">PROMPT</div>
                  <div className="text-sm text-gray-700 max-h-36 overflow-y-auto pr-2 whitespace-pre-wrap m-0 w-full">
                    {(channel as any).prompt || channel.brand_voice_initial || ''}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right section with action buttons */}
            <div className="flex items-center ml-4 space-x-3">
              {/* Archive/Restore button */}
              <button 
                type="button"
                className={`p-2 rounded border-2 border-gray-300 hover:bg-gray-50 ${isArchiving ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleArchiveClick}
                disabled={isArchiving}
                style={{ display: 'flex', minWidth: '90px', justifyContent: 'center', alignItems: 'center' }}
              >
                {isArchiving ? (
                  <Icon icon="eos-icons:loading" className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <>
                    <Icon 
                      icon={channel.is_active ? "flowbite:archive-solid" : "mdi:refresh"}
                      className="h-5 w-5 text-primary mr-2" 
                      aria-label={channel.is_active ? "Deactivate" : "Activate"}
                    />
                    <span className="text-sm">{channel.is_active ? "Deactivate" : "Activate"}</span>
                  </>
                )}
              </button>
              
              {/* Delete button */}
              <button 
                type="button"
                className={`p-2 rounded border-2 border-red-300 hover:bg-red-50 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleDeleteClick}
                disabled={isDeleting}
                style={{ display: 'flex', minWidth: '90px', justifyContent: 'center', alignItems: 'center' }}
              >
                {isDeleting ? (
                  <Icon icon="eos-icons:loading" className="h-5 w-5 text-red-500 animate-spin" />
                ) : (
                  <>
                    <Icon 
                      icon="material-symbols:delete-outline"
                      className="h-5 w-5 text-red-500 mr-2" 
                      aria-label="Delete"
                    />
                    <span className="text-sm text-red-500">Delete</span>
                  </>
                )}
              </button>
              
              {/* Edit button */}
              <button 
                type="button"
                className="p-2 rounded border-2 border-gray-300 hover:bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEditClick) {
                    onEditClick();
                  } else if (onClick) {
                    onClick();
                  }
                }}
                style={{ display: 'flex', minWidth: '40px', justifyContent: 'center' }}
              >
                <Icon icon="material-symbols:edit" className="h-5 w-5 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </button>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Confirm Deletion"
        message="Are you sure you want to delete this channel? This action cannot be undone."
      />
    </>
  );
} 