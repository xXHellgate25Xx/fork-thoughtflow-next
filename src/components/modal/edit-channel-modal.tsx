import React, { useState, useEffect } from 'react';
import { 
  ChannelData, 
  useModifyChannelMutation,
  useUpdatePillarChannelPromptMutation 
} from 'src/libs/service/channel/channel';
import { channelIcons } from 'src/theme/icons/channel-icons';
import { Icon } from '@iconify/react';

// Add this below imports to disable the specific ESLint rule
/* eslint-disable jsx-a11y/label-has-associated-control */

// Interface matching the response format from getChannelsByPillarId
interface PillarChannelResponse {
  error: null | string;
  data?: Array<{
    id: string;
    pillar_id: string;
    prompt: string;
    channel: {
      id: string;
      url: string;
      name: string;
      user_id: string;
      is_active: boolean;
      account_id: string;
      is_private: boolean | null;
      channel_type: string;
      integration_id: string;
      brand_voice_initial: string | null;
      brand_voice_feedback: string | null;
    };
  }>;
  count: null | number;
  status: number;
  statusText: string;
}

interface EditChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: ChannelData;
  onSuccess?: (updatedChannel: ChannelData) => void;
}

export function EditChannelModal({ isOpen, onClose, channel, onSuccess }: EditChannelModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [brandVoiceInitial, setBrandVoiceInitial] = useState('');
  const [brandVoiceFeedback, setBrandVoiceFeedback] = useState('');
  const [promptValue, setPromptValue] = useState('');
  const [pillarId, setPillarId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [promptUpdated, setPromptUpdated] = useState(false);
  const [nameChanged, setNameChanged] = useState(false);
  
  const [modifyChannel] = useModifyChannelMutation();
  const [updatePillarChannelPrompt] = useUpdatePillarChannelPromptMutation();
  
  useEffect(() => {
    if (channel) {
      setName(channel.name || '');
      setUrl(channel.url || '');
      setType(channel.type?.toLowerCase() || channel.channel_type?.toLowerCase() || '');
      setIsActive(channel.is_active);
      setBrandVoiceInitial(channel.brand_voice_initial || '');
      setBrandVoiceFeedback(channel.brand_voice_feedback || '');
      
      // Store prompt value and pillar_id
      if ((channel as any).prompt) {
        setPromptValue((channel as any).prompt || '');
      }
      if ((channel as any).pillar_id) {
        setPillarId((channel as any).pillar_id);
      }
      
      setPromptUpdated(false);
      setNameChanged(false);
    }
  }, [channel]);
  
  // Check if name has been changed
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setNameChanged(newName !== channel.name);
  };
  
  const channelTypes: Record<string, string> = {
    wix: 'Wix',
    wordpress: 'WordPress',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    instagram: 'Instagram',
    medium: 'Medium',
    x: 'X',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    pinterest: 'Pinterest',
    substack: 'Substack',
  };
  
  const handleSubmit = async () => {
    // Validate required fields
    if (!name.trim()) {
      alert("Channel name is required");
      return;
    }

    try {
      setIsLoading(true);
      
      // Create simplified channel payload with updated name and status
      const channelPayload = {
        id: channel.id,
        name, // Use the editable name
        is_active: isActive,
        url: channel.url || '', // Keep the original URL
      };
      
      // Create a copy of the channel with updated values for immediate UI update
      const updatedChannel = {
        ...channel,
        name, // Update name
        is_active: isActive,
        prompt: promptValue
      };
      
      // If there's a prompt value and pillar ID, update the association
      let updateSuccess = false;
      if (promptValue !== undefined && pillarId) {
        try {
          // Use the association_id if available, otherwise fall back to channel.id
          const associationId = (channel as any).association_id || channel.id;
          
          // Use the new API endpoint to update both prompt and active status
          console.log('Updating pillar-channel with payload:', {
            association_id: associationId,
            prompt: promptValue,
            is_active: isActive
          });
          
          // Call the API with the updated endpoint and format
          // Note: This uses the current API structure that expects:
          // PUT /functions/v1/api/pillar-channels/${association_id}
          // with body: { prompt, is_active }
          const result = await updatePillarChannelPrompt({
            pillar_id: pillarId,
            channel_id: channel.id, // Keep for backward compatibility
            prompt: promptValue,
            payload: {
              id: channel.id,
              name, // Use the updated name
              is_active: isActive,
              association_id: associationId // Pass the association ID in the payload
            }
          }).unwrap();
          
          console.log('Pillar-channel update result:', result);
          
          setPromptUpdated(true);
          updateSuccess = true;
        } catch (error) {
          console.error('Failed to update pillar-channel prompt:', error);
          // Continue with fallback approach if this fails
        }
      }
      
      // Only fall back to modifyChannel if the pillar-channel update failed and there is no association
      if (!updateSuccess && !pillarId) {
        // Use existing modifyChannel mutation if needed for backward compatibility
        console.log('Falling back to modifyChannel with payload:', {
          channel_id: channel.id,
          payload: {
            name, // Use the updated name
            is_active: isActive
          }
        });
        
        await modifyChannel({ 
          channel_id: channel.id,
          payload: {
            name, // Use the updated name
            channel_type: type,
            is_active: isActive
          }
        }).unwrap();
      }
      
      if (onSuccess) {
        // Pass the updated channel back to the parent component for immediate UI update
        onSuccess(updatedChannel);
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating channel:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6 sticky top-0 bg-white pt-2 pb-2 border-b border-gray-100">Edit Channel</h2>
        
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6 pb-2">
          {/* Channel name field (editable) */}
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-1">
              Channel Name <span className="text-red-500">*</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className={`w-full px-3 py-2 border ${!name.trim() ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
            {!name.trim() && <p className="mt-1 text-sm text-red-500">Channel name is required</p>}
            {nameChanged && <p className="mt-1 text-xs text-blue-500">Channel name will be updated everywhere this channel is used</p>}
          </div>
          
          {/* Channel Type (readonly) */}
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-1">
              Channel Type (cannot be changed)
            </div>
            <div className="flex items-center px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
              {type && (
                <Icon 
                  icon={channelIcons[type] || 'mdi:web'} 
                  className="w-5 h-5 mr-2 text-blue-600" 
                />
              )}
              <span>{type ? (channelTypes[type] || type) : 'Unknown'}</span>
            </div>
          </div>
          
          {/* Active status toggle */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Channel Status
              </span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="relative inline-flex items-center cursor-pointer focus:outline-none"
              >
                <div className={`w-11 h-6 rounded-full transition ${isActive ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div 
                    className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform transform ${isActive ? 'translate-x-5' : ''}`} 
                  />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </button>
            </div>
          </div>
          
          {/* Prompt (from the pillar-channel association) */}
          {promptValue !== undefined && (
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-1">
                Channel Prompt
              </div>
              <textarea
                id="channel-prompt"
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the prompt for this channel-pillar association"
                rows={8}
              />
              <p className="mt-1 text-xs text-gray-500">
                {promptUpdated 
                  ? "✓ Prompt was successfully updated!"
                  : "Note: This will update the prompt in the pillar-channel association."}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 