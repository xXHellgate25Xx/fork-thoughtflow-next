import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { CONFIG } from 'src/config-global';
import { _products } from 'src/_mock';

import { Box, Button, Card, Typography, TextField, IconButton } from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { Icon } from '@iconify/react';
import { useGetContentQuery, useGetContentViewCountQuery, useUpdateContentMutation } from 'src/libs/service/content/content';
import { useCreatePublishToWixMutation } from 'src/libs/service/wix/wix';
import { useParams } from 'react-router-dom';
import { useRouter } from 'src/routes/hooks';
import { fDateTime } from 'src/utils/format-time';

import Viewer from 'src/components/editor/Viewer';
import { toDraft } from 'ricos-content/libs/toDraft';
import { fromPlainText } from 'ricos-content/libs/fromPlainText';
import { fromDraft } from 'ricos-content/libs/fromDraft';
import { toPlainText } from 'ricos-content/libs/toPlainText';
import { RichContent } from 'ricos-schema';
import Editor from 'src/components/editor/Editor';
// ----------------------------------------------------------------------

const channelIcons: { [key: string]: string } = {
  wix: 'simple-icons:wix',
  linkedin: 'devicon:linkedin',
  facebook: 'logos:facebook',
  instagram: 'skill-icons:instagram'
}

export default function Page() {
  const [createPublishToWix] = useCreatePublishToWixMutation();
  const [updateContentSupabase] = useUpdateContentMutation();

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
  // console.log(`Content: ${JSON.stringify(content)}`);
  const is_published = content?.status === 'published'
  const created_time = content?.created_at;
  // console.log(created_time);
  const published_time = content?.published_at;
  // console.log(published_time)
  const channel_id = content?.channel_id

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
  const [editorRichContent, setEditorRichContent] = useState<any>(fromPlainText("Loading..."));

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  

  function convertJson(input:any) {
    return JSON.stringify({
        nodes: input.nodes,
        metadata: input.metadata
    });
}


  // console.log(createdAt);
  useEffect(() => {
    if (content) {
      setCreatedAt(fDateTime(content.created_at, "DD MMM YYYY h:mm a") || 'N/A');
      setPublishedAt(fDateTime(content.published_at, "DD MMM YYYY h:mm a") || 'N/A');
      setPublished(content.status === 'published');
      setIsLoading(false);
      try {
        const read_richContent = content.rich_content ?? JSON.stringify(fromPlainText(content.content_body));
        setEditorRichContent(read_richContent);
        let parsedContent;
        if (typeof read_richContent === 'string') {

          parsedContent = toDraft(JSON.parse(read_richContent));
        }
        else {
          parsedContent = toDraft(read_richContent);  
        }
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
  // Function to handle go back button
  const handleGoBack = () => {
    router.back();
  }

  // Function to handle publishing to Wix
  const handlePublish = async () => {
    if (content) {
      // console.log(content);
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

  // Function to enable editing
  const handleEditClick = () => {
    if (content) {
      setEditedTitle(content.title || '');
      setIsEditing(true);
    }
    else {
      console.error(`Content is not loaded!!`)
    }
  };

  // Function to save edits
  const handleSaveClick = async () => {
    try {
      setIsLoading(true);
      // Ensure plaintext is awaited before proceeding
      const plaintext = await toPlainText(JSON.parse(editorRichContent));
      if (plaintext) {
        // console.log("PlainText");
        // console.log(plaintext);
  
        const { data: updateData } = await updateContentSupabase({
          contentId: contentId || '',
          content: {
            title: editedTitle,
            content_body: plaintext,
            rich_content: editorRichContent,
          }
        });
        // console.log(editorRichContent);
        // console.log("Data sent:");
        // console.log(updateData);
  
        setIsEditing(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };
  

  // Function to cancel editing
  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedTitle(content?.title || '');
  };


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
          
          {isEditing ? (
            <TextField
            sx={{
              width: '50%', // Adjust width as needed (e.g., '100%' for full width)
              '& .MuiInputBase-root': {
                height: '35pt', // Adjust height
              },
              '& .MuiOutlinedInput-root': {
                fontSize: '1.5rem', // Increase font size
              }
            }}
            variant="outlined"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            autoFocus
            />
          ) : (
            <Typography variant='h4'>
              {contentLoading === false ? content?.title: "Loading..."}
          </Typography>
          )
          }
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

          {!isEditing && (
          <>
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
              // disabled={isLoading}
              disabled
            >
              Repurpose
            </Button>
            <Button
              sx={{ display: published ? 'none' : 'flex' }}
              variant="outlined"
              color="inherit"
              startIcon={<Icon icon="akar-icons:edit" />}
              disabled={isLoading}
              onClick={handleEditClick}
            >
              Edit
            </Button>
            <Button
              sx={{ display: published ? 'none' : 'flex' }}
              variant="outlined"
              color="error"
              startIcon={<Icon icon="solar:archive-bold" />}
              // disabled={isLoading}
              disabled
            >
              Archive
            </Button>
          </>
          )}
          {isEditing && (
            <>
                <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSaveClick}
                disabled={isLoading}>
                  Save
                </Button>
                <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleCancelClick}
                disabled={isLoading}>
                  Cancel
                </Button>
            </>
          )}
        </Box>
        <Card sx={{ mt: '1rem', padding: '1rem' }}>
          {!isEditing ? (
          <Viewer content={richContent}/>
          ) : (
          <Editor 
          callback={(e:any)=>{
            setEditorRichContent(convertJson(e))
          }} 
          content={editorRichContent}
          channel_id={channel_id}
          />
          )
          }
        </Card>

      </DashboardContent>
    </>
  );
}
