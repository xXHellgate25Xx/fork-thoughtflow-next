import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { ChannelData, useGetAllChannelsOfUserQuery, useGetPillarChannelCountQuery } from 'src/libs/service/channel/channel';

import { AddPillarModal } from 'src/components/modal/add-pillar-modal';
import { PillarCardItem, PillarItem } from 'src/sections/pillar/pillar-card-item';

import { 
  useGetAllPillarQuery,
  useCreatePillarMutation
} from '../libs/service/pillar/home';

// Extended PillarItem with created_at for sorting
interface ExtendedPillarItem extends PillarItem {
  created_at: string | Date;
}

// A component to display channel count consistently in the table
function PillarChannelCount({ pillarId }: { pillarId: string }) {
  const { data: channelCountData } = useGetPillarChannelCountQuery({ pillar_id: pillarId });
  const channelCount = channelCountData?.count || 0;
  
  return (
    <>{channelCount}</>
  );
}

// ----------------------------------------------------------------------

export default function Page() {
  const [allPillars, setAllPillars] = useState<ExtendedPillarItem[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showActive, setShowActive] = useState(true);
  const { data: allPillarsData, isLoading, refetch } = useGetAllPillarQuery();
  
  // Get all channels to associate with pillars
  const { data: allChannelsData } = useGetAllChannelsOfUserQuery();
  
  useEffect(() => {
    const fetchChannelsForPillars = async () => {
      if (!isLoading && allPillarsData?.data && allChannelsData?.data) {
        // Create a map of pillarId to channels
        const channelsByPillar = (allChannelsData.data as ChannelData[]).reduce((acc: Record<string, Array<{id: string; name: string; type: string}>>, channel: ChannelData) => {
          if (channel.pillar_id) {
            if (!acc[channel.pillar_id]) {
              acc[channel.pillar_id] = [];
            }
            acc[channel.pillar_id].push({
              id: channel.id,
              name: channel.name,
              type: channel.type
            });
          }
          return acc;
        }, {});
        
        // Add channels to each pillar
        const pillarsWithChannels = allPillarsData.data.map(pillar => ({
          ...pillar,
          channels: channelsByPillar[pillar.id] || []
        })) as ExtendedPillarItem[];
        
        setAllPillars(pillarsWithChannels);
      }
    };
    
    fetchChannelsForPillars();
  }, [isLoading, allPillarsData, allChannelsData]);

  const router = useRouter();
  const handleWhatsOnMyMind = () => {
    router.push("/create");
  };
  const [createPillar, { isLoading: createPillarIsLoading }] = useCreatePillarMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmClicked, setIsConfirmClicked] = useState(false);
  const handleAddItem = async (pillar_name: string, description: string, keyword: string) => {
    try {
      setIsConfirmClicked(true);
      await createPillar({pillar_name, description, keyword}).unwrap();
      setIsModalOpen(false);
      refetch(); // refresh the useGetAllPillarQuery() automatically
    } catch (addItemError) {
      console.error('Error creating pillar:', addItemError);
    } finally {
      setIsConfirmClicked(false);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'card' ? 'table' : 'card');
  };

  const toggleActiveFilter = () => {
    setShowActive(!showActive);
    console.log('Show Active Toggle:', !showActive);
    console.log('Total Pillars:', allPillars.length);
    console.log('Active Pillars:', allPillars.filter(pillar => pillar.is_active).length);
    console.log('Inactive Pillars:', allPillars.filter(pillar => !pillar.is_active).length);
  };

  // Filter pillars based on active status if filter is enabled
  const filteredPillars = showActive 
    ? allPillars.filter(pillar => pillar.is_active)
    : allPillars;

  const activePillarCount = allPillars.filter(pillar => pillar.is_active).length;

  return (
    <>
      <Helmet>
        <title> {`Home - ${CONFIG.appName}`}</title>
        <meta
          name="description"
          content="ThoughtFlow"
        />
        <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />
      </Helmet>

      <DashboardContent>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-2xl font-semibold">
            Strategy
          </h1>

          <div className="flex flex-col items-end gap-3">
            {/* New Pillar button */}
            <button
              type="button"
              className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/80 transition-colors"
              onClick={() => {
                setIsModalOpen(true);
                setIsConfirmClicked(false);
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12 4v16m-8-8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="font-bold">New Pillar</span>
            </button>

            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-white shadow-sm text-primary' : 'hover:bg-gray-200'}`}
                  onClick={() => setViewMode('card')}
                >
                  <Icon icon="material-symbols:grid-view" className={`w-5 h-5 ${viewMode === 'card' ? 'text-primary' : ''}`} />
                </button>
                <button
                  type="button"
                  className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'hover:bg-gray-200'}`}
                  onClick={() => setViewMode('table')}
                >
                  <Icon icon="material-symbols:table-rows-outline" className={`w-5 h-5 ${viewMode === 'table' ? 'text-primary' : ''}`} />
                </button>
              </div>

              {/* Active filter toggle */}
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={toggleActiveFilter}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300"
                >
                  <div className={`relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full ${showActive ? 'bg-primary' : 'bg-gray-300'}`}>
                    <div 
                      className={`absolute w-5 h-5 transition duration-200 ease-in-out transform bg-white rounded-full top-0.5 ${showActive ? 'right-0.5' : 'left-0.5'}`}
                    />
                  </div>
                  <span>Active ({activePillarCount} Pillars)</span>
                </button>
              </div>
            </div>
          </div>
          <AddPillarModal 
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAddItem={handleAddItem}
            isLoading={isConfirmClicked}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
            <p className="ml-3">Fetching pillars...</p>
          </div>
        ) : filteredPillars?.length ? (
          viewMode === 'card' ? (
            (() => {
              console.log('Rendering Card View, Items:', filteredPillars.length, 'Active:', filteredPillars.filter(p => p.is_active).length, 'Inactive:', filteredPillars.filter(p => !p.is_active).length);
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...filteredPillars]
                    .sort((a, b) => {
                      // First, sort by is_active (active pillars first)
                      if (a.is_active !== b.is_active) {
                        return a.is_active === true ? -1 : 1;
                      }
                      // Then, sort by created_at if is_active is the same
                      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    })
                    .map((pillar) => (
                      <div key={pillar.id} className="h-full">
                        <PillarCardItem 
                          product={pillar}
                          onClick={() => router.push(`/pillar/${pillar.id}`)}
                        />
                      </div>
                    ))}
                </div>
              );
            })()
          ) : (
            (() => {
              console.log('Rendering Table View, Items:', filteredPillars.length, 'Active:', filteredPillars.filter(p => p.is_active).length, 'Inactive:', filteredPillars.filter(p => !p.is_active).length);
              return (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] bg-white border-separate border-spacing-0 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-6 py-4 text-left text-sm font-medium text-primary">
                          Pillar Title
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-primary">
                          Keyword
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-primary w-[30%]">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-primary w-[10%]">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-primary">
                          Channel
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-primary">
                          Views
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-primary">
                          Published
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-primary">
                          Drafts
                        </th>
                        <th className="px-3 py-4 hidden" />
                      </tr>
                    </thead>
                    <tbody>
                      {[...filteredPillars]
                        .sort((a, b) => {
                          if (a.is_active !== b.is_active) {
                            return a.is_active === true ? -1 : 1;
                          }
                          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                        })
                        .map((pillar) => (
                          <tr 
                            key={pillar.id} 
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-6 py-6">
                              <a 
                                href={`/pillar/${pillar.id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  router.push(`/pillar/${pillar.id}`);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    router.push(`/pillar/${pillar.id}`);
                                  }
                                }}
                                className="text-sm text-blue-500 hover:underline cursor-pointer font-medium"
                              >
                                {pillar.name}
                              </a>
                            </td>
                            <td className="px-6 py-6 text-sm text-gray-800">
                              {pillar.primary_keyword || ''}
                            </td>
                            <td className="px-6 py-6 text-sm text-gray-800">
                              <div className="line-clamp-3 pr-4 max-w-md">
                                {pillar.description || ''}
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <div className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${
                                pillar.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                                  pillar.is_active ? 'bg-green-500' : 'bg-gray-500'
                                }`} />
                                {pillar.is_active ? 'ACTIVE' : 'INACTIVE'}
                              </div>
                            </td>
                            <td className="px-6 py-6 text-center text-sm text-gray-800">
                              {pillar.channels?.length || 0}
                            </td>
                            <td className="px-6 py-6">
                              <div className="flex items-center justify-start gap-2">
                                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor"/>
                                </svg>
                                <span className="text-sm font-medium text-primary">{pillar.content_views || 0}</span>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <div className="flex items-center justify-start gap-2">
                                <Icon 
                                  icon="tabler:arrow-up"
                                  className="w-5 h-5 text-primary"
                                />
                                <span className="text-sm font-medium text-primary">{pillar.n_published || 0}</span>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <div className="flex items-center justify-start gap-2">
                                <Icon 
                                  icon="mdi:file"
                                  className="w-5 h-5 text-primary"
                                />
                                <span className="text-sm font-medium text-primary">{pillar.n_draft || 0}</span>
                              </div>
                            </td>
                            <td className="px-3 py-6 text-center hidden">
                              <button 
                                type="button" 
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add action menu functionality here
                                }}
                              >
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="currentColor"/>
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              );
            })()
          )
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">
              {showActive ? "No active pillars found." : "No pillars found."}
            </p>
          </div>
        )}
      </DashboardContent>
    </>
  );
}
