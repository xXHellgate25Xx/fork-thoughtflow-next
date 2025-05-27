import React, { useState, useEffect } from 'react';
import { 
  ChannelData, 
  useCreateChannelMutation, 
  useGetAllChannelsOfUserQuery, 
  useAssociatePillarChannelMutation 
} from 'src/libs/service/channel/channel';
import { channelIcons } from 'src/theme/icons/channel-icons';
import { Icon } from '@iconify/react';

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  pillarId: string;
  onSuccess?: (channel: ChannelData) => void;
}

export function AddChannelModal({ isOpen, onClose, pillarId, onSuccess }: AddChannelModalProps) {
  // Channel selection type
  const [channelSelectionType, setChannelSelectionType] = useState<'new' | 'existing'>('new');
  const [selectedExistingChannelId, setSelectedExistingChannelId] = useState<string>('');
  
  // New channel form fields
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('wix');
  const [prompt, setPrompt] = useState('');
  const [brandVoiceInitial, setBrandVoiceInitial] = useState('');
  const [brandVoiceFeedback, setBrandVoiceFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form validation
  const [errors, setErrors] = useState<{
    name?: string;
    url?: string;
    selectedChannel?: string;
  }>({});
  
  // Get all available channels
  const { data: channelsData, isLoading: isLoadingChannels } = useGetAllChannelsOfUserQuery();
  const existingChannels = channelsData?.data || [];
  
  // RTK Query mutations
  const [createChannel] = useCreateChannelMutation();
  const [associatePillarChannel] = useAssociatePillarChannelMutation();
  
  const availableTypes = [
    { id: 'wix', label: 'Wix' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'x', label: 'X' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'pinterest', label: 'Pinterest' },
    { id: 'medium', label: 'Medium' },
    { id: 'substack', label: 'Substack' },
    { id: 'other', label: 'Other' },
  ];
  
  // Reset selected existing channel when switching to new channel mode
  useEffect(() => {
    if (channelSelectionType === 'new') {
      setSelectedExistingChannelId('');
    }
    // Clear errors when switching modes
    setErrors({});
  }, [channelSelectionType]);
  
  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      url?: string;
      selectedChannel?: string;
    } = {};
    
    if (channelSelectionType === 'new') {
      if (!name.trim()) {
        newErrors.name = 'Channel name is required';
      }
      
      if (!url.trim()) {
        newErrors.url = 'Channel URL is required';
      }
    } else if (channelSelectionType === 'existing') {
      if (!selectedExistingChannelId) {
        newErrors.selectedChannel = 'Please select a channel';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    // Validate form based on selection type
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      if (channelSelectionType === 'new') {
        // Create new channel
        const payload = {
          name,
          channel_type: type,
          url,
          is_active: true,
          brand_voice_initial: brandVoiceInitial,
          brand_voice_feedback: brandVoiceFeedback,
          prompt // This will be extracted and used for pillar-channel association
        };
        
        console.log('Creating channel with payload:', {
          payload,
          pillar_id: pillarId
        });
        
        const result = await createChannel({ 
          payload,
          pillar_id: pillarId // Pass pillar_id directly for association
        }).unwrap();
        
        console.log('Channel created successfully:', result);
        
        // Check if the response has data property, which could be the channel or the transformed data
        if (result?.data) {
          onSuccess?.(result.data);
        } else {
          // Check if result has the raw API response structure
          const rawResult = result as any;
          if (rawResult?.data?.id && rawResult?.association?.id) {
            // Handle the case where the response is in the original format with both data and association
            // Create a merged object to match what the component expects
            const mergedChannel = {
              ...rawResult.data,
              pillar_id: rawResult.association.pillar_id,
              prompt: rawResult.association.prompt
            };
            onSuccess?.(mergedChannel as ChannelData);
          }
        }
      } else {
        // Handle existing channel selection using the RTK Query mutation
        console.log('Associating existing channel with pillar:', {
          channel_id: selectedExistingChannelId,
          pillar_id: pillarId,
          prompt
        });
        
        try {
          const result = await associatePillarChannel({
            pillar_id: pillarId,
            channel_id: selectedExistingChannelId,
            prompt
          }).unwrap();
          
          console.log('Channel associated successfully:', result);
          
          // Find the selected channel and return it with the added association
          const selectedChannel = existingChannels.find((channel: ChannelData) => channel.id === selectedExistingChannelId);
          if (selectedChannel) {
            const channelWithPillar = {
              ...selectedChannel,
              pillar_id: pillarId,
              prompt,
              // If result contains an association ID, add it - get it from the proper location in the response
              association_id: result?.data?.id || (result as any)?.id || ''
            };
            onSuccess?.(channelWithPillar);
          }
        } catch (error) {
          console.error('Failed to associate channel with pillar:', error);
          throw error;
        }
      }
      
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating/linking channel:', error);
      // You could add state for error message display here
      alert('Failed to create/link channel. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setUrl('');
    setType('wix');
    setPrompt('');
    setBrandVoiceInitial('');
    setBrandVoiceFeedback('');
    setSelectedExistingChannelId('');
    setChannelSelectionType('new');
    setErrors({});
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-0 flex items-center justify-center z-50 p-4 ml-[100px] md:ml-[120px] lg:ml-[150px]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6 sticky top-0 bg-white pt-2 pb-2 border-b border-gray-100">Add Channel</h2>
        
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6 pb-2">
          {/* Channel Selection Type */}
          <div className="mb-6">
            <div className="flex gap-4">
              <label htmlFor="channel-type-new" className="inline-flex items-center">
                <input
                  id="channel-type-new"
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  checked={channelSelectionType === 'new'}
                  onChange={() => setChannelSelectionType('new')}
                />
                <span className="ml-2">New Channel</span>
              </label>
              <label htmlFor="channel-type-existing" className="inline-flex items-center">
                <input
                  id="channel-type-existing"
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  checked={channelSelectionType === 'existing'}
                  onChange={() => setChannelSelectionType('existing')}
                />
                <span className="ml-2">Existing Channel</span>
              </label>
            </div>
          </div>
          
          {/* Existing Channel Selection */}
          {channelSelectionType === 'existing' && (
            <div>
              <label htmlFor="existing-channel" className="block text-sm font-medium text-gray-700 mb-1">
                Select Channel <span className="text-red-500">*</span>
                {isLoadingChannels ? (
                  <div className="mt-2 flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2" />
                    <span>Loading channels...</span>
                  </div>
                ) : existingChannels.length === 0 ? (
                  <div className="mt-2 text-sm text-gray-500">No existing channels found. Please create a new channel.</div>
                ) : (
                  <>
                    <select
                      id="existing-channel"
                      value={selectedExistingChannelId}
                      onChange={(e) => setSelectedExistingChannelId(e.target.value)}
                      className={`w-full mt-1 px-3 py-2 border ${errors.selectedChannel ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    >
                      <option value="">Select a channel</option>
                      {existingChannels.map((channel: ChannelData) => (
                        <option key={channel.id} value={channel.id}>
                          {channel.name} ({channel.url || 'No URL'})
                        </option>
                      ))}
                    </select>
                    {errors.selectedChannel && (
                      <p className="mt-1 text-sm text-red-500">{errors.selectedChannel}</p>
                    )}
                  </>
                )}
              </label>
              
              {/* Show selected channel details */}
              {selectedExistingChannelId && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  {(() => {
                    const selectedChannel = existingChannels.find((c: ChannelData) => c.id === selectedExistingChannelId);
                    return selectedChannel ? (
                      <div className="flex items-center">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-50 rounded-md mr-3">
                          <Icon 
                            icon={channelIcons[selectedChannel.channel_type?.toLowerCase() || 'web'] || 'mdi:web'} 
                            className="w-5 h-5 text-blue-600" 
                          />
                        </div>
                        <div>
                          <div className="font-medium">{selectedChannel.name}</div>
                          <div className="text-sm text-gray-500">{selectedChannel.url}</div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          )}
          
          {/* New Channel Form */}
          {channelSelectionType === 'new' && (
            <>
              <div>
                <label htmlFor="channel-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Name <span className="text-red-500">*</span>
                  <input
                    type="text"
                    id="channel-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full mt-1 px-3 py-2 border ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="My Channel"
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </label>
              </div>
              
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  Channel Type <span className="text-red-500">*</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableTypes.map((channelType) => (
                    <button
                      type="button"
                      key={channelType.id}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors text-left ${
                        type === channelType.id
                          ? 'bg-blue-50 border border-blue-300'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setType(channelType.id)}
                    >
                      <Icon 
                        icon={channelIcons[channelType.id] || 'mdi:web'} 
                        className="w-5 h-5" 
                      />
                      <span className="text-sm">{channelType.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="channel-url" className="block text-sm font-medium text-gray-700 mb-1">
                  Channel URL <span className="text-red-500">*</span>
                  <input
                    type="text"
                    id="channel-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className={`w-full mt-1 px-3 py-2 border ${errors.url ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="example.com"
                    required
                  />
                  {errors.url && (
                    <p className="mt-1 text-sm text-red-500">{errors.url}</p>
                  )}
                </label>
              </div>
            </>
          )}
          
          {/* Prompt field for both new and existing channels */}
          <div>
            <label htmlFor="channel-prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Channel Prompt
              <textarea
                id="channel-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the prompt for this channel-pillar association"
                rows={4}
              />
            </label>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 mt-8">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                'Add Channel'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 