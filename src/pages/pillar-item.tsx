import { Icon } from '@iconify/react';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Button, TextField, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { useGetAllAccountsQuery } from 'src/libs/service/account/account';
import {
  useGetPillarByIdQuery,
  useUpdatePillarNameMutation,
  useDeactivatePillarMutation,
} from 'src/libs/service/pillar/pillar-item';
import { useGetPillarChannelCountQuery } from 'src/libs/service/channel/channel';

// Import Channel List View component
import { PillarChannelList } from 'src/sections/channel/pillar-channel-list';

// ----------------------------------------------------------------------

export default function Page() {
  const { 'pillar-id': pillarId } = useParams();
  // Get allAccountsApiData
  const {data: allAccountsApiData} = useGetAllAccountsQuery();
  const accounts_data = allAccountsApiData?.data;
  const {
    data: pillarData,
    isLoading: getPillarIsLoading,
    refetch: getPillarRefetch,
  } = useGetPillarByIdQuery({ pillarId });
  
  const { data: channelCountData } = useGetPillarChannelCountQuery({ pillar_id: pillarId || '' });
  const channelCount = channelCountData?.count || 0;
  
  const pillar = pillarData?.data[0];
  const pillarIsActive = getPillarIsLoading ? null : pillar?.is_active;
  const [pillarName, setPillarName] = useState<string>('');
  const [pillarDesc, setPillarDesc] = useState('');
  const [pillarKeyword, setPillarKeyword] = useState('');
  const [pillarSeoTitle, setPillarSeoTitle] = useState('');
  const [pillarIntention, setPillarIntention] = useState('');
  const [pillarUrl, setPillarUrl] = useState('');
  const [pillarEstVolume, setPillarEstVolume] = useState('');
  
  const [tmpName, setTmpName] = useState('');
  const [tmpDesc, setTmpDesc] = useState('');
  const [tmpKeyword, setTmpKeyword] = useState('');
  const [tmpSeoTitle, setTmpSeoTitle] = useState('');
  const [tmpIntention, setTmpIntention] = useState('');
  const [tmpUrl, setTmpUrl] = useState('');
  const [tmpEstVolume, setTmpEstVolume] = useState('');
  const [estVolumeError, setEstVolumeError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  useEffect(() => {
    if (pillar && accounts_data) {
      console.log(pillar);
      if (pillar?.account_id !== localStorage.getItem('accountId')) {
      const local_account_id = localStorage.getItem('accountId') || ''
      const account_name = accounts_data.find((item: any) => item.id === pillar.account_id)?.name;
      localStorage.setItem('accountId', pillar.account_id || local_account_id);
      localStorage.setItem('accountName', account_name);
      }
    }
    setPillarName(pillar?.name ?? "");
    setPillarDesc(pillar?.description ?? '');
    setPillarKeyword(pillar?.primary_keyword ?? '');
    setPillarSeoTitle((pillar as any)?.seo_title ?? "");
    setPillarIntention((pillar as any)?.intention ?? "");
    setPillarUrl(pillar?.authority_url ?? "");
    setPillarEstVolume((pillar as any)?.est_volume ?? "");
    
    setTmpName(pillar?.name ?? '');
    setTmpDesc(pillar?.description ?? '');
    setTmpKeyword(pillar?.primary_keyword ?? '');
    setTmpSeoTitle((pillar as any)?.seo_title ?? "");
    setTmpIntention((pillar as any)?.intention ?? "");
    setTmpUrl(pillar?.authority_url ?? "");
    setTmpEstVolume((pillar as any)?.est_volume ?? "");
  }, [pillar, accounts_data]);

  const router = useRouter();
  const handleGoBack = () => {
    router.back();
  };

  const [UpdatePillarNameMutation] = useUpdatePillarNameMutation();
  const [DeactivatePillarMutation] = useDeactivatePillarMutation();

  const handleDeactivateButton = async () => {
    try {
      // If the pillar is currently active, use DeactivatePillarMutation to deactivate it
      if (pillarIsActive) {
        await DeactivatePillarMutation({ pillarId });
      } else {
        // If the pillar is currently inactive, use UpdatePillarNameMutation to activate it
        await UpdatePillarNameMutation({
          pillarId: pillarId || '',
          newName: pillarName,
          newDesc: pillarDesc,
          newKeyword: pillarKeyword,
          newAuthorityUrl: pillarUrl,
          newEstimatedVolume: pillarEstVolume,
          newIntention: pillarIntention,
          isActive: true
        });
      }
      
      // Refresh the data
      getPillarRefetch();
    } catch (error) {
      console.error("Error toggling pillar active state:", error);
    }
  };

  const handleAddContent = () => {
    router.push(`/create?pillarId=${pillarId}&pillarName=${encodeURIComponent(pillarName)}`);
  };

  // Allow empty string or numbers only
  const validateNumericInput = (value: string): boolean => value === '' || /^[0-9]+$/.test(value);

  const handleEstVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (validateNumericInput(value)) {
      setTmpEstVolume(value);
      setEstVolumeError(null);
    } else {
      // Keep the old value but show an error
      setEstVolumeError('Please enter numbers only');
    }
  };

  const toggleEditMode = async () => {
    if (isEditMode) {
      // Clear any validation errors
      setEstVolumeError(null);
      
      // Validate EST. VOLUME before saving
      if (tmpEstVolume !== '' && !validateNumericInput(tmpEstVolume)) {
        setEstVolumeError('Please enter numbers only');
        return; // Prevent saving if validation fails
      }
      
      // Save changes
      setPillarName(tmpName);
      setPillarKeyword(tmpKeyword);
      setPillarSeoTitle(tmpSeoTitle);
      setPillarDesc(tmpDesc);
      setPillarIntention(tmpIntention);
      setPillarUrl(tmpUrl);
      setPillarEstVolume(tmpEstVolume);

      try {
        const { data: updatePillarData } = await UpdatePillarNameMutation({
          pillarId: pillarId || '',
          newName: tmpName,
          newDesc: tmpDesc,
          newKeyword: tmpKeyword,
          newAuthorityUrl: tmpUrl,
          newEstimatedVolume: tmpEstVolume || "0",
          newIntention: tmpIntention
        });
        console.log(updatePillarData);
        // Optionally refresh data after update
        getPillarRefetch();
      } catch (error) {
        console.error("Error updating pillar data:", error);
        // You could add error handling here, like showing a notification
      }
      
      setIsEditMode(false);
    } else {
      // Enter edit mode
      setTmpKeyword(pillarKeyword);
      setTmpSeoTitle(pillarSeoTitle);
      setTmpDesc(pillarDesc);
      setTmpIntention(pillarIntention);
      setTmpUrl(pillarUrl);
      setTmpEstVolume(pillarEstVolume);
      setIsEditMode(true);
    }
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    // Reset temp values to current values
    setTmpName(pillarName);
    setTmpKeyword(pillarKeyword);
    setTmpSeoTitle(pillarSeoTitle);
    setTmpDesc(pillarDesc);
    setTmpIntention(pillarIntention);
    setTmpUrl(pillarUrl);
    setTmpEstVolume(pillarEstVolume);
    // Clear any validation errors
    setEstVolumeError(null);
  };

  return (
    <>
      <Helmet>
        <title> {`${pillarName} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Details of a content pillar" />
      </Helmet>

      <DashboardContent>
        {/* Header with breadcrumb navigation and action buttons */}
        <div className="flex justify-between items-center mb-8">
          {/* Breadcrumb navigation */}
          <div className="flex items-center gap-2 text-gray-600">
            <button type="button" onClick={() => router.push('/strategy')} className="hover:text-blue-600 flex items-center">
              <Icon icon="mdi:arrow-left" className="w-5 h-5 mr-1" />
              Strategy
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{pillarName} content pillar</span>
          </div>
          
          {/* Action buttons - aligned to the right */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg w-12 h-12 hover:bg-gray-50"
              onClick={handleDeactivateButton}
              title={pillarIsActive ? "Deactivate Pillar" : "Activate Pillar"}
            >
              <Icon icon={pillarIsActive ? "mdi:archive-outline" : "mdi:refresh"} className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              className={`flex items-center justify-center gap-2 bg-white border ${isEditMode ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg w-12 h-12 hover:bg-gray-50`}
              onClick={toggleEditMode}
            >
              <Icon icon={isEditMode ? "mdi:content-save" : "mdi:pencil"} className={`w-5 h-5 ${isEditMode ? 'text-blue-500' : ''}`} />
            </button>
            
            {isEditMode && (
              <button
                type="button"
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg w-12 h-12 hover:bg-gray-50"
                onClick={cancelEdit}
              >
                <Icon icon="mdi:close" className="w-5 h-5" />
              </button>
            )}
            
            <button
              type="button"
              className="px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2 hover:bg-primary/80 transition-colors"
              onClick={handleAddContent}
            >
              <Icon icon="mdi:plus" className="w-5 h-5" />
              <span>Content</span>
            </button>
          </div>
        </div>

        {/* Pillar details in grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 mb-8">
          {/* Left column */}
          <div>
            <div className="mb-5">
              <div className="text-sm font-bold text-primary uppercase mb-1">PILLAR NAME</div>
              {isEditMode ? (
                <input
                  type="text"
                  value={tmpName}
                  onChange={(e) => setTmpName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <button 
                  type="button"
                  className="text-left w-full cursor-pointer hover:bg-gray-50 rounded-md"
                  onClick={() => setIsEditMode(true)}
                >
                  <div className="text-base font-normal py-1">
                    {pillarName || ""}
                  </div>
                </button>
              )}
            </div>
            
            <div className="mb-5">
              <div className="text-sm font-bold text-primary uppercase mb-1">PRIMARY KEYWORD</div>
              {isEditMode ? (
                <input
                  type="text"
                  value={tmpKeyword}
                  onChange={(e) => setTmpKeyword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <button 
                  type="button"
                  className="text-left w-full cursor-pointer hover:bg-gray-50 rounded-md"
                  onClick={() => setIsEditMode(true)}
                >
                  <div className="text-base font-normal py-1">
                    {pillarKeyword || ""}
                  </div>
                </button>
              )}
            </div>
            
            <div className="mb-5">
              <div className="text-sm font-bold text-primary uppercase mb-1">DESCRIPTION</div>
              {isEditMode ? (
                <textarea
                  value={tmpDesc}
                  onChange={(e) => setTmpDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <button 
                  type="button"
                  className="text-left w-full cursor-pointer hover:bg-gray-50 rounded-md"
                  onClick={() => setIsEditMode(true)}
                >
                  <div className="text-base font-normal py-1">
                    {pillarDesc || ""}
                  </div>
                </button>
              )}
            </div>
            
            <div>
              <div className="text-sm font-bold text-primary uppercase mb-1">INTENTION</div>
              {isEditMode ? (
                <input
                  type="text"
                  value={tmpIntention}
                  onChange={(e) => setTmpIntention(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <button 
                  type="button"
                  className="text-left w-full cursor-pointer hover:bg-gray-50 rounded-md"
                  onClick={() => setIsEditMode(true)}
                >
                  <div className="text-base font-normal py-1">
                    {pillarIntention || ""}
                  </div>
                </button>
              )}
            </div>
          </div>
          
          {/* Right column */}
          <div>
            <div className="mb-5">
              <div className="text-sm font-bold text-primary uppercase mb-1">STATUS</div>
              <div className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${pillarIsActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                <span className={`mr-1.5 w-1.5 h-1.5 rounded-full ${pillarIsActive ? 'bg-green-600' : 'bg-gray-600'}`} />
                {pillarIsActive ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>
            
            <div className="mb-5">
              <div className="text-sm font-bold text-primary uppercase mb-1">AUTHORITY PAGE URL</div>
              {isEditMode ? (
                <input
                  type="text"
                  value={tmpUrl}
                  onChange={(e) => setTmpUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <button 
                  type="button"
                  className="text-left w-full cursor-pointer hover:bg-gray-50 rounded-md"
                  onClick={() => setIsEditMode(true)}
                >
                  <div className="text-base font-normal py-1">
                    {pillarUrl}
                  </div>
                </button>
              )}
            </div>
            
            <div className="mb-5">
              <div className="text-sm font-bold text-primary uppercase mb-1">EST. VOLUME</div>
              {isEditMode ? (
                <div>
                  <input
                    type="text"
                    value={tmpEstVolume}
                    onChange={handleEstVolumeChange}
                    className={`w-full px-3 py-2 border ${estVolumeError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter numbers only"
                  />
                  {estVolumeError && (
                    <div className="text-red-500 text-xs mt-1">{estVolumeError}</div>
                  )}
                </div>
              ) : (
                <button 
                  type="button"
                  className="text-left w-full cursor-pointer hover:bg-gray-50 rounded-md"
                  onClick={() => setIsEditMode(true)}
                >
                  <div className="text-base font-normal py-1">
                    {pillarEstVolume || ""}
                  </div>
                </button>
              )}
            </div>
            
            <div className="mb-5">
              <div className="text-sm font-bold text-primary uppercase mb-1">VIEWS</div>
              <div className="flex items-center py-1">
                <Icon icon="mdi:eye-outline" className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-base">{pillar?.content_views || "0"}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center bg-primary/10 text-primary px-4 py-2 rounded-md">
                <Icon icon="mdi:file-document-outline" className="w-5 h-5 mr-2" />
                <span className="font-medium mr-1">Published:</span>
                <span>{pillar?.n_published || "0"}</span>
              </div>
              
              <div className="flex items-center bg-primary/10 text-primary px-4 py-2 rounded-md">
                <Icon icon="mdi:file-outline" className="w-5 h-5 mr-2" />
                <span className="font-medium mr-1">Draft:</span>
                <span>{pillar?.n_draft || "0"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Channel View Section */}
        <PillarChannelList pillarId={pillarId} />
        
      </DashboardContent>
    </>
  );
}
