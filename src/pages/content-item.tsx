import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { CONFIG } from 'src/config-global';
import { _products } from 'src/_mock';

import { Box, Button, Card, Typography } from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { Icon } from '@iconify/react';
import { useGetContentQuery, useGetContentViewCountQuery } from 'src/libs/service/content/content';
import { useCreatePublishToWixMutation } from 'src/libs/service/wix/wix';
import { useParams } from 'react-router-dom';
import { useRouter } from 'src/routes/hooks';
import { fDateTime } from 'src/utils/format-time';

import Viewer from 'src/components/editor/Viewer';
import { toDraft } from 'ricos-content/libs/toDraft';
import { fromPlainText } from 'ricos-content/libs/fromPlainText';
import { fromDraft } from 'ricos-content/libs/fromDraft';
import { RichContent } from 'ricos-schema';
// ----------------------------------------------------------------------

const channelIcons: { [key: string]: string } = {
  wix: 'simple-icons:wix',
  linkedin: 'devicon:linkedin',
  facebook: 'logos:facebook',
  instagram: 'skill-icons:instagram'
}

export default function Page() {
  const [createPublishToWix] = useCreatePublishToWixMutation();

  const { 'content-id': contentId} = useParams();
  const {
    data: contentData,
    isLoading: contentLoading,
    refetch: contentRefetch
  } = useGetContentQuery({contentId: contentId || ''});
  // console.log(`Query: ${JSON.stringify(useGetContentQuery({contentId: contentId || ''}))}`)
  // console.log(`isLoading: ${JSON.stringify(contentLoading)}`);
  // console.log(`ContentData : ${JSON.stringify(contentData)}`)
  const content = contentData?.data?.[0];
  console.log(`Content: ${JSON.stringify(content)}`);
  const is_published = content?.status === 'published'
  const created_time = content?.created_at;
  // console.log(created_time);
  const published_time = content?.published_at;
  // console.log(published_time)

  const {
    data: viewsData,
    isLoading: viewsLoading,
    refetch: viewsRefetch
  } = useGetContentViewCountQuery({contentId: contentId || '', type_of_agg: 'all'});

  const views_obj = viewsData?.data?.[0];
  // console.log(`Views: ${JSON.stringify(views_obj)}`);

  const [published, setPublished] = useState(false);
  const [createdAt, setCreatedAt] = useState('Loading...');
  const [publishedAt, setPublishedAt] = useState('Loading...');
  const [views, setViews] = useState('Loading...');
  const [channelType, setChannelType] = useState('wix');
  const [richContent, setRichContent] = useState(toDraft(fromPlainText("Loading...")));
  const [isLoading, setIsLoading] = useState(true);
  // console.log(createdAt);
  useEffect(() => {
    if (content) {
      setCreatedAt(fDateTime(content.created_at, "DD MMM YYYY h:mm a") || 'N/A');
      setPublishedAt(fDateTime(content.published_at, "DD MMM YYYY h:mm a") || 'N/A');
      setPublished(content.status === 'published');
      setIsLoading(false);
  
      try {
        const parsedContent = typeof content.rich_content === 'string' 
          ? toDraft(JSON.parse(content.rich_content))
          : toDraft(content.rich_content);
        setRichContent(parsedContent);
      } catch (error) {
        console.error("Error parsing richContent:", error);
        setRichContent(toDraft(fromPlainText("Error loading content")));
      }
    }
    if (views_obj) {
      setViews(views_obj.view_counts);
    }
    else
    {
      setViews('N/A');
    }
  }, [content, views_obj]);
  // console.log(`Content Data: ${JSON.stringify(contentData?.data)}`);

  const router = useRouter();
  const handleGoBack = () => {
    router.replace('/content');
  }

  const handlePublish = async () => {
    if (content) {
      console.log(content);
      if (content.channel_id) {
      const {data: publishData}  = await createPublishToWix({
        channel_id: content.channel_id, 
        CreatePublishReq: { 
          title: content.title,
          richContent: content.rich_content // Example content
        },
      })
    }
    }
    else {
      console.error(`Content is not loaded!!`)
    }
  }




  return (
    <>
      <Helmet>
        <title> {`Content Item - ${CONFIG.appName}`}</title>
        <meta
          name="description"
          content="Details of a content"
        />
        <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />
      </Helmet>

      <DashboardContent>
        <Box display="flex" alignItems="center" mb='1rem' gap='1rem'>
          <Button color='inherit'>
            <Icon icon='ep:back' width={30} onClick={(handleGoBack)}/>
          </Button>
          <Icon icon={channelIcons[channelType]} width={30} height={30} />
          <Typography variant='h4'>
            {contentLoading === false ? content?.title: "Loading..."}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap='0.5rem'>
          <Box flexGrow={1}>
            <Typography>
              <b>Created at:</b> {contentLoading === false ? createdAt : "Loading..."}
            </Typography>
            {/* <Typography display={published ? 'block' : 'none'}> */}
            <Typography display={published ? 'block' : 'none'}>
            <b>Published at:</b> {contentLoading === false ? publishedAt : "Loading..."}
            </Typography>
          </Box>

          <Box display={published ? 'flex' : 'none'} alignItems="center" gap='0.5rem'>
            <Icon icon='carbon:view-filled' width={27}/>
            <Typography mr='1rem'>{views}</Typography>
          </Box>

          <Button
            sx={{ display: published ? 'none' : 'flex' }}
            variant="contained"
            color="inherit"
            onClick={(handlePublish)}
            disabled={isLoading}
            startIcon={<Icon icon="ic:baseline-publish" />}
          >
            Publish
          </Button>
          <Button
            sx={{ display: published ? 'flex' : 'none' }}
            href={content?.published_url || "#"}
            variant="contained"
            color="inherit"
            startIcon={<Icon icon="cuida:open-in-new-tab-outline" />}
          >
            Go to post
          </Button>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Icon icon="mingcute:copy-fill" />}
            disabled={isLoading}
          >
            Repurpose
          </Button>
          <Button
            sx={{ display: published ? 'none' : 'flex' }}
            variant="outlined"
            color="inherit"
            startIcon={<Icon icon="akar-icons:edit" />}
            disabled={isLoading}
          >
            Edit
          </Button>
          <Button
            sx={{ display: published ? 'none' : 'flex' }}
            variant="outlined"
            color="error"
            startIcon={<Icon icon="solar:archive-bold" />}
            disabled={isLoading}
          >
            Archive
          </Button>
        </Box>
        <Card sx={{ mt: '1rem', padding: '1rem' }}>
<Viewer content={richContent}/>
        </Card>

      </DashboardContent>
    </>
  );
}
