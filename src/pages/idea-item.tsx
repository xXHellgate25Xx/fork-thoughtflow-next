import { Icon } from '@iconify/react';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

// Import ChannelTestView component
import { useGetContentByIdeaQuery, useGetIdeaByIdQuery } from 'src/libs/service/idea/idea';
import { channelIcons } from 'src/theme/icons/channel-icons';
import Viewer from 'src/components/editor/Viewer';

import { fromPlainText } from '@wix/ricos';
import { useGetChannelsByPillarIdQuery } from 'src/libs/service/channel/channel';
import { extractHashtags } from 'src/utils/hashtag';

// ----------------------------------------------------------------------

export default function Page() {
  const { 'idea-id': ideaId } = useParams();

  // Get idea by ID
  const { 
    data: ideaItemData,
    isLoading: ideaItemIsLoading,
    refetch: ideaItemRefetch
  } = useGetIdeaByIdQuery({ ideaId })
  const ideaItem = ideaItemData?.data[0]

  // Get content generated from idea
  const { 
    data: contentData,
    isLoading: contentDataIsLoading,
    refetch: contentDataRefetch
  } = useGetContentByIdeaQuery({ ideaId})

  const { data: channelData, isLoading: channelDataIsLoading } = useGetChannelsByPillarIdQuery(
    { pillar_id: ideaItem?.pillar_id },
    { skip: !ideaItem?.pillar_id }
  );
  
  const [contentList, setContentList] = useState<any[]>([]); 
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [channelType, setChannelType] = useState<string | null>(null);
  const [richContent, setRichContent] = useState(fromPlainText('Loading...'));
  const [contentBody, setcontentBody] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false); // State to toggle text expansion
  const [hashtags, setHashtags] = useState<string[]>([]);

  useEffect(() => {
    setContentList(contentData?.data || [])
    setChannelType(contentData?.data?.[0]?.channel_type || null)
    setSelectedContent(contentData?.data?.[0] || null)
  }, [contentData]);

  useEffect(() => {
    try {
      const read_richContent =
        selectedContent.rich_content ?? JSON.stringify(fromPlainText(selectedContent.content_body));
      let parsedContent;
      if (typeof read_richContent === 'string') {
        parsedContent = JSON.parse(read_richContent);

      } else {
        parsedContent = read_richContent;
      }
      setRichContent(parsedContent);
      setcontentBody(selectedContent.content_body);
    } catch (error) {
      console.error('Error parsing richContent:', error);
      setRichContent(fromPlainText('Error loading content'));
    }

  }, [selectedContent])

  useEffect(() => {
    if (channelType !== 'wix' && contentBody) {
      const extractedHashtags = extractHashtags(contentBody);
      setHashtags(extractedHashtags);
    }
  }, [channelType, contentBody]);

  const handleChannelClick = (contentId: string) => {
    // Find the corresponding content
    const content = contentList.find((item) => item.content_id === contentId);
    setSelectedContent(content || null);
    setChannelType(content?.channel_type)
  };

  const toggleText = () => {
    setIsExpanded((prev) => !prev); // Toggle the expanded state
  };

  const router = useRouter();
  const handleGoBack = () => {
    router.back();
  };
  const handleGoToContent = () => {
    if (selectedContent?.content_id) {
      router.push(`/content/${selectedContent.content_id}`); // Redirect to the content page
    } else {
      console.error('Content ID is not available');
    }
  }

  // Create a lookup map from channel_id to channel_name
  const channelIdToName = useMemo(() => {
    if (!channelData?.data) return {};
    // Adjust the property names as needed based on your actual data structure
    return channelData.data.reduce((acc: any, channel: any) => {
      acc[channel.id] = channel.name; // or channel.channel_name
      return acc;
    }, {} as Record<string, string>);
  }, [channelData]);

  // Map channel_name onto each content item
  const contentListWithChannelName = useMemo(() => {
    if (!contentData?.data) return [];
    const order = ['wix', 'linkedin', 'instagram', 'facebook', 'x', 'youtube', 'tiktok', 'email', 'medium', 'other'];
    return contentData.data
      .map(content => ({
        ...content,
        channel_name: content.channel_id ? channelIdToName[content.channel_id] || '' : 'Loading Channel Name'
      }))
      .sort((a, b) => {
        const indexA = order.indexOf(a.channel_type || 'other');
        const indexB = order.indexOf(b.channel_type || 'other');
        return indexA - indexB;
      });
  }, [contentData, channelIdToName]);

  return (
    <>
      <Helmet>
        <title> {`${ideaItem?.title || ''} - ${CONFIG.appName}`}</title>
        <meta name="description" content="Details of an idea" />
      </Helmet>

      <DashboardContent>
        {(ideaItemIsLoading || contentDataIsLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-accent">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
          <p className="ml-3">Fetching data...</p>
        </div>)}

        {/* Header with breadcrumb navigation and action buttons */}
        <div className="flex justify-between items-center mb-8">
          {/* Breadcrumb navigation */}
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <button type="button" 
              onClick={() => router.push('/idea')} 
              className="hover:text-blue-600 flex items-center text-sm"
            >
              <Icon icon="mdi:arrow-left" className="w-5 h-5 mr-2" />
              Ideas
            </button>
            <span>/</span>
            <span>Post Details</span>
          </div>
          
          {/* Action buttons - aligned to the right */}
          {/* <div className="flex gap-3">
            <button
              type="button"
              className="flex items-center justify-center bg-transparent border-2 border-primary rounded-md p-2"
              onClick={() => {}}
            >
              <Icon icon="mdi:archive-outline" className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              className="flex items-center justify-center bg-transparent border-2 border-primary rounded-md p-2"
            >
              <Icon icon="mdi:pencil" className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              className="flex items-center justify-center gap-1 bg-primary text-white rounded-md px-5 py-2"
              onClick={() => {}}
            >
              <Icon icon="mdi:plus" className="w-5 h-5" />
              <span>Content</span>
            </button>
          </div> */}
        </div>

        {/* Idea details */}
        <div className='flex flex-col text-sm gap-2 mb-5'>
          <div className="grid grid-cols-6 gap-2">
            <div className="font-semibold text-primary uppercase mb-1">Date created</div>
            <div className="col-span-5">{new Date(ideaItem?.created_at).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }) || "Loading..."}</div>
          </div>

          <div className="grid grid-cols-6 gap-2">
            <div className="font-semibold text-primary uppercase mb-1">IDEA</div>
            {/* <div className="col-span-5">{ideaItem?.text || "Loading..."}</div> */}
            <div className="col-span-5">
              {ideaItem?.text
                ? isExpanded
                  ? ideaItem.text // Show full text if expanded
                  : `${ideaItem.text.slice(0, 200)}...` // Show first 200 characters if collapsed
                : "Loading..."}
              {ideaItem?.text && ideaItem.text.length > 200 && (
                <button
                  type="button"
                  onClick={toggleText}
                  className="text-secondary font-semibold hover:underline ml-2"
                >
                  {isExpanded ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-6 gap-2 items-center">
            <div className="font-semibold text-primary uppercase mb-1">POSTED CHANNELS</div>
            <div className="flex gap-2 col-span-5 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-2">
              {contentListWithChannelName?.map((item: any) => (
                <button
                  type="button"
                  key={item.content_id}
                  className={`px-3 py-0.5 rounded-md border min-w-[100px] flex items-center gap-1 flex-shrink-0 ${
                    selectedContent?.content_id === item.content_id 
                      ? 'bg-sky-50 border-2 border-sky-500' 
                      : 'bg-white border border-gray-200'
                  }`}
                  onClick={() => handleChannelClick(item.content_id)}
                >
                  <Icon icon={channelIcons[item.channel_type]} className='w-7 h-7'/>
                  <p className="truncate">{item.channel_name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content view */}
        <div className='grid grid-cols-3 gap-2'>
          {/* Content viewer */}
          <div className='col-span-2 bg-white rounded-md p-6'>
            <div className='flex'>
              <div className='flex-grow font-semibold text-primary mb-3 text-2xl'>
                {selectedContent?.title || ''}
              </div>
              <div className=''>
                <button
                  type='button'
                  onClick={() => handleGoToContent()}
                >
                  <Icon icon='uil:edit' className='w-7 h-7 text-primary'/>
                </button>
              </div>
            </div>
            
            <Viewer content={richContent} />
          </div>

          {/* SEO or Hashtags */}
          <div className='col-span-1 bg-white rounded-md p-6'>
            {['wix','medium','substack', 'other'].includes(channelType || '')
            ? <>
              <div className='font-semibold text-primary mb-3 text-xl'>SEO Details</div>
              <div className='flex flex-col gap-2'>
                <div className='font-semibold'>Long-tail keyword</div>
                <div>{selectedContent.long_tail_keyword}</div>
                <div className='font-semibold'>SEO title</div>
                <div>{selectedContent.seo_title_tag}</div>
                <div className='font-semibold'>SEO meta description</div>
                <div>{selectedContent.seo_meta_description}</div>
                <div className='font-semibold'>SEO slug</div>
                <div>{selectedContent.seo_slug}</div>
              </div>
            </>
            : <>
              <div className='font-semibold text-primary mb-3 text-xl'>Hashtags</div>
              <div className='flex flex-col gap-1'>
                {hashtags.map((tag, index) => (
                  <span key={index} className='text-sky-600'>
                    #{tag}
                  </span>
                ))}
                {hashtags.length === 0 && (
                  <p className='text-gray-500'>No hashtags found</p>
                )}
              </div>
            </>
            }
          </div>
        </div>
      </DashboardContent>
    </>
  );
}
