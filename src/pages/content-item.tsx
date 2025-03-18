import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';

import { Icon } from '@iconify/react';
import { Box, Button, Card, Checkbox, FormControlLabel, Link, List, ListItem, Typography } from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { useGetAllAccountsQuery } from 'src/libs/service/account/account';
import {
  useGetAllChannelsOfUserQuery,
  useGetChannelByIDQuery
} from 'src/libs/service/channel/channel';
import {
  useGetContentQuery,
  useGetContentViewCountQuery,
  useUpdateContentMutation,
} from 'src/libs/service/content/content';
import {
  useGenerateContentWithFeedbackMutation
} from 'src/libs/service/content/generate';
import {
  useCreateIdeaContentMutation
} from 'src/libs/service/idea/idea';
import {
  useRepurposeContentMutation
} from 'src/libs/service/idea/repurpose';
import {
  useGetPillarByIdQuery
} from 'src/libs/service/pillar/pillar-item';

import { useParams } from 'react-router-dom';
import TextField from 'src/components/text-field/text-field';
import { createMetaDescriptionTag, createTitleTag } from 'src/interfaces/seoData-interface';
import { useCreatePublishToWixMutation } from 'src/libs/service/wix/wix';
import { useRouter } from 'src/routes/hooks';
import { fDateTime } from 'src/utils/format-time';

import { fromPlainText } from 'ricos-content/libs/fromPlainText';
import { toHtml } from 'ricos-content/libs/server-side-converters';
import { toDraft } from 'ricos-content/libs/toDraft';
import { toPlainText } from 'ricos-content/libs/toPlainText';
import { RichContent } from 'ricos-schema';
import Editor from 'src/components/editor/Editor';
import Viewer from 'src/components/editor/Viewer';
import { channelIcons } from 'src/theme/icons/channel-icons';
import { deepCloneAs } from 'src/utils/object-utils';
import { checkSEO, handleKeyDown, handleSeoSlugChange } from 'src/utils/seo';

import { PublishForm } from 'src/components/publish_message/publish_message';
import { RepurposeForm } from 'src/components/repurpose/repurpose';
import { RepurposeSelect } from 'src/sections/repurpose/repurpose-select';
// ----------------------------------------------------------------------

export default function Page() {
  const [createPublishToWix] = useCreatePublishToWixMutation();
  const [updateContentSupabase] = useUpdateContentMutation();
  const [repurposeContent] = useRepurposeContentMutation();
  const [createContent] = useCreateIdeaContentMutation();
  const [generateContentWithFeedback, { isLoading: isFeedbackLoading }] = useGenerateContentWithFeedbackMutation();

  const { 'content-id': contentId } = useParams();

  // Get allAccountsApiData
  const { data: allAccountsApiData } = useGetAllAccountsQuery();
  const accounts_data = allAccountsApiData?.data;

  // Get contentData
  const {
    data: contentData,
    isLoading: contentLoading,
    refetch: contentRefetch,
  } = useGetContentQuery({ contentId: contentId || '' });
  const content = contentData?.data?.[0];
  // console.log(`Content: ${JSON.stringify(content)}`);
  const channel_id = content?.channel_id;

  const {
    data: viewsData,
    isLoading: viewsLoading,
    refetch: viewsRefetch,
  } = useGetContentViewCountQuery({ contentId: contentId || '', type_of_agg: 'all' });

  const views_obj = viewsData?.data?.[0];

  // Load ChannelData
  const {
    data: channelData,
    isLoading: channelLoading,
    refetch: channelRefetch,
  } = useGetChannelByIDQuery({ channel_id: content?.channel_id || "" })
  const channel = channelData?.data?.[0];

  // List Channels
  const {
    data: channelList,
    isLoading: channelListLoading,
    refetch: channelListRefetch,
  } = useGetAllChannelsOfUserQuery();

  // Load ContentPillarData
  const {
    data: pillarData,
    isLoading: pillarLoading,
    refetch: pillarRefetch,
  } = useGetPillarByIdQuery({ pillarId: content?.pillar_id || "" })
  const pillar = pillarData?.data?.[0];

  // Display states
  const [published, setPublished] = useState(false);
  const [createdAt, setCreatedAt] = useState('Loading...');
  const [publishedAt, setPublishedAt] = useState('Loading...');
  const [views, setViews] = useState('Loading...');
  const [channelType, setChannelType] = useState<string | null>('');
  const [richContent, setRichContent] = useState(toDraft(fromPlainText('Loading...')));
  const [editorRichContent, setEditorRichContent] = useState<RichContent>(fromPlainText('Loading...'));
  const [isInitRichContent, setIisInitRichContent] = useState(true);
  const [pillarName, setPillarName] = useState('Loading...');
  const [originalContent, setOriginalContent] = useState<RichContent>(fromPlainText('Loading...'));

  // Publish states
  const [channelName, setChannelName] = useState('Loading...');
  const [channelUrl, setChannelUrl] = useState('Loading...');
  // Options for Repurpose
  const [channelRepId, setChannelRepId] = useState<string>('Loading...');
  const channelIdRepRef = useRef(channelRepId);
  const [channelListIdAndName, setChannelListIdAndName] = useState<
    { id: string; name: string; url: string }[] | undefined
  >(undefined);
  const [channelRep, setChannelRep] = useState<
    { id: string; name: string, url: string } | undefined
  >(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  // SEO states
  const [seoSlug, setSeoSlug] = useState('');
  const [seoMetaDescription, setMetaDescription] = useState('');
  const [seoTitleTag, setSeoTitleTag] = useState('');
  const [longTailKeyword, setLongTailKeyword] = useState('');
  const seoSlugInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const seoSlugCursorRef = useRef(0); // Track cursor position without causing re-renders

  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isPublishFormClicked, setIsPublishFormClicked] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('#');

  const [isRepurposeOpen, setIsRepurposeOpen] = useState(false);
  const [isRepurposeClicked, setIsRepurposeClicked] = useState(false);
  const [feedback, setFeedback] = useState('');

  // SEO Checklist states
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const checklist = [
    "Add focus keyword to title tag",
    "Add focus keyword to H1 (post's title)",
    "Add an image or video to this post",
    "Write alt text for all images",
    "Add focus keyword to body text",
    "Write meta description with focus keyword",
    "Add focus keyword to URL slug",
  ];

  const check_list_explanation = [
    "The title tag includes the focus keyword and is now optimized for searches.",
    "The H1 (post's title) includes the focus keyword and is now optimized for search engines.",
    "This post has visual content, which can drive more traffic and engagement.",
    "All of the images in this post include alt text, which helps search engines and screen reader users understand them.",
    "The body text includes the focus keyword at least once, which helps visitors and search engines better understand what this post is about.",
    "The meta description includes the focus keyword.",
    "The URL slug includes the focus keyword.",
  ]
  const [seoCheckListHoveredIndex, setSeoCheckListHoveredIndex] = useState<number | null>(null);

  function convertJson(input: any) {
    return JSON.stringify({
      nodes: input.nodes,
      metadata: input.metadata,
    });
  }

  useEffect(() => {
    if (content && accounts_data) {
      if (content.account_id !== localStorage.getItem("accountId")) {
        localStorage.setItem("accountId", content.account_id);
        const account_name = accounts_data.find((item: any) => item.id === content.account_id)?.name;
        localStorage.setItem("accountName", account_name);
      }
    }
  }, [content, accounts_data])

  // console.log(createdAt);
  useEffect(() => {
    if (content && channel && pillar) {
      setCreatedAt(fDateTime(content.created_at, 'DD MMM YYYY h:mm a') || 'N/A');
      setPublishedAt(fDateTime(content.published_at, 'DD MMM YYYY h:mm a') || 'N/A');
      setPublished(content.status === 'published');
      setChannelType(content.channel_type);

      setPillarName(pillar.name || 'N/A')
      setChannelName(channel.name || 'N/A');
      setChannelUrl(channel.url || 'N/A');

      // SEO
      setSeoSlug(content.seo_slug || '');
      setMetaDescription(content.seo_meta_description || '');
      setSeoTitleTag(content.seo_title_tag || '');
      setLongTailKeyword(content.long_tail_keyword || '')
      setIsLoading(false);
      try {
        const read_richContent =
          content.rich_content ?? JSON.stringify(fromPlainText(content.content_body));
        setEditorRichContent(read_richContent);
        setOriginalContent(read_richContent);
        let parsedContent;
        if (typeof read_richContent === 'string') {
          parsedContent = toDraft(JSON.parse(read_richContent));
        } else {
          parsedContent = toDraft(read_richContent);
        }
        setRichContent(parsedContent);
        setIisInitRichContent(false);
      } catch (error) {
        console.error('Error parsing richContent:', error);
        setRichContent(toDraft(fromPlainText('Error loading content')));
      }
      setSeoSlug(content.seo_slug || '');
      setMetaDescription(content.seo_meta_description || '');
      setSeoTitleTag(content.seo_title_tag || '');
    }
    if (views_obj) {
      setViews(views_obj.view_counts);
    } else {
      setViews('0');
    }

  }, [content, views_obj, channel, pillar]);

  useEffect(() => {
    // Check SEO Checklist
    if (content && pillar && !isInitRichContent) {
      // const primary_keyword = pillar.primary_keyword || "";
      const auto_check_list = checkSEO(checklist, editorRichContent, content.title, seoTitleTag, seoMetaDescription, seoSlug, longTailKeyword);
      setCheckedItems(auto_check_list);
    }
  }, [content, views_obj, channel, pillar, isInitRichContent])

  useEffect(() => {
    if (channelList && channel) {
      const formattedChannels = channelList?.data
        .filter((channel_ele: any) => channel_ele.id !== channel_id) // Exclude the current ID
        .map((channel_ele: any) => {
          const requiredPairs = { id: channel_ele.id, name: channel_ele.name, url: channel_ele.url };
          return requiredPairs;
        }) ?? [];
      setChannelRepId(channel.id || 'Loading...');
      setChannelListIdAndName(formattedChannels.length > 0 ?
        formattedChannels :
        [{ id: '1', name: 'No existing channels' }]);
    }
  }, [channelList, channel]);

  // Restore cursor position after state update
  useEffect(() => {
    if (seoSlugInputRef.current) {
      seoSlugInputRef.current.selectionStart = seoSlugCursorRef.current;
      seoSlugInputRef.current.selectionEnd = seoSlugCursorRef.current;
    }
  }, [seoSlug]); // Runs AFTER `seoSlug` is updated

  useEffect(() => {
    channelIdRepRef.current = channelRepId;
  }, [channelRepId]);

  // useEffect(() => {
  //   console.log(checkedItems);
  // }, [checkedItems]);

  const router = useRouter();
  // Function to handle go back button
  const handleGoBack = () => {
    router.back();
  };

  // Function to handle publishing to Wix
  const handlePublishButton = async () => {
    if (content && contentId) {
      setIsPublishing(true);
      // console.log(content);
      setIsPublishOpen(true);
    }
  };

  // Publish
  const handlePublish = async () => {
    if (content && contentId) {
      setIsPublishFormClicked(true);
      if (content.channel_id) {
        const { data: publishData, error: publishError } = await createPublishToWix({
          channel_id: content.channel_id,
          CreatePublishReq: {
            title: content.title,
            richContent: JSON.stringify(content.rich_content), // Rich Content
            content_id: contentId,
            seo_slug: content.seo_slug,
            seo_title_tag: content.seo_title_tag ? createTitleTag(content.seo_title_tag) : null,
            seo_meta_description: content.seo_meta_description
              ? createMetaDescriptionTag(content.seo_meta_description)
              : null,
          },
        })
        if (publishError) {
          console.error(publishError);
          setIsPublishing(false);
          setIsPublishFormClicked(false);
        }
        else {
          const title = publishData?.draftPost?.title;
          const url = publishData?.draftPost?.url;
          const published_url = url ? `${url.base}${url.path}` : '#';

          setPublishedUrl(published_url)
          setIsPublishFormClicked(false);
          setPublished(true);
        }
      }
    } else {
      console.error(`Content is not loaded!!`);
    }
  };

  // Function to enable editing
  const handleEditClick = () => {
    if (content) {
      setEditedTitle(content.title || '');
      setIsEditing(true);
    } else {
      console.error(`Content is not loaded!!`);
    }
  };

  // Function to save edits
  const handleSaveClick = async () => {
    try {
      setIsLoading(true);

      const plaintext = await toPlainText(editorRichContent);
      const contentHtml = toHtml(deepCloneAs<RichContent, RichContent>(editorRichContent));
      if (plaintext) {
        const { data: updateData } = await updateContentSupabase({
          contentId: contentId || '',
          content: {
            title: editedTitle,
            content_body: plaintext,
            rich_content: editorRichContent,
            seo_slug: seoSlug,
            seo_meta_description: seoMetaDescription,
            seo_title_tag: seoTitleTag,
            long_tail_keyword: longTailKeyword,
            content_html: contentHtml,
          },
        });

        setIsEditing(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  // Function to cancel editing
  const handleCancelClick = () => {
    setIsEditing(false);
    setEditorRichContent(originalContent);
    setEditedTitle(content?.title || '');
    setLongTailKeyword(content?.long_tail_keyword || '');
    setSeoTitleTag(content?.seo_title_tag || '');
    setMetaDescription(content?.seo_meta_description || '');
    setSeoSlug(content?.seo_slug || '');
  };

  // Function to do Repurpose
  const handleRepurpose = () => {
    setIsRepurposeOpen(true);
  }

  // Handle the Repurpose Form Clicked
  const handleRepurposeClick = async () => {
    // console.log("Handle Repurpose Click here: ",channelIdRepRef.current);
    setIsRepurposeClicked(true);
    // Generate the new repurposed content
    const { data: repurposeData } = await repurposeContent({
      ideaId: content?.idea_id || "",
      payload: {
        channel_id: channelRep?.id || "",
        content_body: content?.content_body || ""
      }
    })
    // Create the new content
    if (repurposeData) {
      // console.log(repurposeData);
      const { data: createContentData } = await createContent({
        ideaId: repurposeData?.idea_id,
        payload: {
          content_body: repurposeData?.content_body,
          rich_content: repurposeData?.rich_content,
          title: repurposeData?.title,
          excerpt: repurposeData?.excerpt || "",
          status: repurposeData?.status || "",
          content_type: repurposeData?.content_type || "",
          seo_meta_description: repurposeData?.seo_meta_description || null,
          seo_slug: repurposeData?.seo_slug || null,
          seo_title_tag: repurposeData?.seo_title_tag || null,
          long_tail_keyword: repurposeData?.long_tail_keyword,
          channel_id: repurposeData?.channel_id || "",
          content_html: repurposeData?.content_html,
        }
      })

      // Navigate to the new content
      const new_content_id = createContentData?.data?.[0]?.content_id;
      // console.log(new_content_id);
      if (new_content_id) {
        router.replace(`/content/${new_content_id}`)
      }
    }
    else {
      console.error("Cannot repurpose content!!!")
    }
    setIsRepurposeClicked(false);
    setIsRepurposeOpen(false);
  }

  const handleSelectChannel = (chosenChannelId: string) => {
    setChannelRepId(chosenChannelId);
    const chosen_channel = channelListIdAndName?.find((channel_ele: any) => channel_ele.id === chosenChannelId);
    setChannelRep(chosen_channel);
    setTimeout(() => {
      handleRepurpose();
    }, 0); // Runs after state update
  };

  // const handleSEOChecklistItemClick = (item: any) => {
  //   setCheckedItems((prev) =>
  //     prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
  //   );
  // };
  // Function to handle feedback submission
  const handleFeedbackSubmit = async () => {
    if (feedback.trim() && channel_id && content) {
      try {
        const plaintext = await toPlainText(editorRichContent);

        const { data: feedbackResponse } = await generateContentWithFeedback({
          channel_id,
          gen_content: {
            idea: content.idea_id, // Make sure to include the idea ID
            feedback,
            content: plaintext
          }
        });

        console.log('Received feedback response:', feedbackResponse);

        if (feedbackResponse) {

          if (feedbackResponse.rich_content) {
            console.log('Updating editor with new rich content');
            let processedRichContent;
            if (typeof feedbackResponse.rich_content === 'string') {
              try {
                processedRichContent = JSON.parse(feedbackResponse.rich_content);
              } catch (e) {
                console.error('Error parsing rich_content string:', e);
                processedRichContent = feedbackResponse.rich_content;
              }
            } else {
              processedRichContent = feedbackResponse.rich_content;
            }
            // Update the editor content state
            setEditorRichContent(processedRichContent);

            // Log the content update
            console.log('Content updated with feedback response');
          } else {
            console.warn('No rich_content in feedback response');
          }

          // Update the title if provided
          if (feedbackResponse.title) {
            console.log('Updating title:', feedbackResponse.title);
            setEditedTitle(feedbackResponse.title);
          }

          // Update other fields
          if (feedbackResponse.seo_meta_description) {
            setMetaDescription(feedbackResponse.seo_meta_description);
          }
          if (feedbackResponse.seo_slug) {
            setSeoSlug(feedbackResponse.seo_slug);
          }
          if (feedbackResponse.seo_title_tag) {
            setSeoTitleTag(feedbackResponse.seo_title_tag);
          }
          if (feedbackResponse.long_tail) {
            setLongTailKeyword(feedbackResponse.long_tail);
          }
        }
      } catch (error) {
        console.error('Error sending feedback:', error);
      }
    } else {
      console.warn('Cannot send feedback: missing required data', {
        hasFeedback: !!feedback.trim(),
        hasChannelId: !!channel_id,
        hasContent: !!content
      });
    }
    setFeedback('');
  };

  return (
    <>
      <Helmet>
        <title> {`Content Item - ${CONFIG.appName}`}</title>
        <meta name="description" content="Details of a content" />
        <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />
      </Helmet>

      <DashboardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* ======================
          Title and Action Buttons
          ========================== */}
          <Box>
            <Box display="flex" alignItems="center" mb="1rem" gap="1rem">
              {/* Back button */}
              <Button color="inherit">
                <Icon icon="ep:back" width={30} onClick={handleGoBack} />
              </Button>
              {/* Title */}
              {isEditing ? (
                <TextField
                  sx={{
                    width: '100%', // Adjust width as needed (e.g., '100%' for full width)
                    '& .MuiInputBase-root': {
                      height: '35pt', // Adjust height
                    },
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.5rem', // Increase font size
                    },
                  }}
                  variant="outlined"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  autoFocus
                />
              ) : (
                <Typography variant="h4">
                  {contentLoading === false ? content?.title : 'Loading...'}
                </Typography>
              )}
            </Box>

            <Box display="flex" alignItems="end" gap="0.5rem">
              <Box flexGrow={1}>
                {/* Content pillar */}
                <Box display='flex' alignItems='center' gap='0.3rem'
                  sx={{ cursor: 'pointer' }}
                  onClick={() => { router.replace(`/pillar/${content?.pillar_id}`) }}
                >
                  <Typography fontWeight='fontWeightBold'>Content pillar:</Typography>
                  <Typography>{pillarName}</Typography>
                  <Icon icon='fluent:open-12-regular' />
                </Box>
                {/* Channel */}
                <Box display='flex' alignItems='center' gap='0.3rem'>
                  <Typography fontWeight='fontWeightBold'>Channel:</Typography>
                  <Icon
                    icon={channelType && channelIcons[channelType] ? channelIcons[channelType] : ''}
                    width={25}
                    height={25}
                  />
                  <Typography>{channelName}</Typography>
                  -
                  <Link href={`https://${channelUrl}`} target="_blank" rel="noopener noreferrer">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Typography>{channelUrl}</Typography>
                      <Icon icon='fluent:open-12-regular' />
                    </Box>
                  </Link>
                </Box>
                {/* Timestamps */}
                <Typography>
                  <b>Created at:</b> {contentLoading === false ? createdAt : 'Loading...'}
                </Typography>
                {/* <Typography display={published ? 'block' : 'none'}> */}
                <Typography display={published ? 'block' : 'none'}>
                  <b>Published at:</b> {contentLoading === false ? publishedAt : 'Loading...'}
                </Typography>
              </Box>
              {/* Views */}
              <Box display={published ? 'flex' : 'none'} alignItems="center" gap="0.5rem">
                <Icon icon="carbon:view-filled" width={27} />
                <Typography mr="1rem">{views}</Typography>
              </Box>

              {/* Action Buttons */}
              {!isEditing && (
                <>
                  <Button
                    sx={{ display: published ? 'none' : 'flex' }}
                    variant="contained"
                    color="inherit"
                    onClick={handlePublishButton}
                    disabled={isLoading || isPublishing}
                    startIcon={<Icon icon="ic:baseline-publish" />}
                  >
                    {isPublishing ? "Publishing..." : "Publish"}
                  </Button>
                  <PublishForm
                    open={isPublishOpen}
                    isLoading={isPublishFormClicked}
                    isPublished={published}
                    onPublish={handlePublish}
                    onClose={() => {
                      setIsPublishOpen(false);
                      setIsPublishing(false);
                      if (published) {
                        router.refresh();
                      }
                    }
                    }
                    onOkay={() => {
                      router.refresh();
                    }}
                    modalTitle="Publish to this Channel?"
                    textFieldText=""
                    buttonText="Publish"
                    channel_url={channelUrl}
                    channel_name={channelName}
                    published_url={publishedUrl}
                    styling={{
                      enableCloseButton: true,
                    }
                    }
                  />
                  <Button
                    sx={{ display: published ? 'flex' : 'none' }}
                    href={content?.published_url || '#'}
                    target="_blank"
                    variant="contained"
                    color="inherit"
                    startIcon={<Icon icon="cuida:open-in-new-tab-outline" />}
                  >
                    Go to post
                  </Button>

                  <RepurposeSelect
                    channelId={channelRepId}
                    onSort={handleSelectChannel}
                    options={channelListIdAndName}
                    disabled={isLoading}
                  />
                  <RepurposeForm
                    open={isRepurposeOpen}
                    isLoading={isRepurposeClicked}
                    onPublish={handleRepurposeClick}
                    onClose={() => {
                      setIsRepurposeOpen(false);

                    }
                    }
                    onOkay={() => {
                      router.refresh();
                    }}
                    modalTitle="Repurpose to"
                    buttonText="Repurpose"
                    channel_url={channelRep?.url || ''}
                    channel_name={channelRep?.name || ''}
                    published_url={publishedUrl}
                    styling={{
                      enableCloseButton: true,
                    }
                    }
                  />

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
                    // sx={{ display: published ? 'none' : 'flex' }}
                    sx={{ display: 'none' }}
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
                    disabled={isLoading}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancelClick}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {/* ======================
          Editor and Settings sidebar
          ========================== */}
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}>
            {/* Viewer or editor */}
            <Box sx={{ flex: 2 }}>
              <Card sx={{ mt: '1rem', padding: '1rem' }}>
                {!isEditing ? (
                  <Viewer content={richContent} />
                ) : (<>
                  <Editor
                    callback={(e: RichContent) => {
                      setEditorRichContent(e);
                    }}
                    content={editorRichContent}
                    channel_id={channel_id}
                    content_id={contentId}
                  />
                  <div style={{
                    marginTop: '1.5rem',
                  }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Enter your feedback to improve the content..."
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: '0.9rem',
                          }
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          onClick={handleFeedbackSubmit}
                          disabled={isFeedbackLoading || !feedback.trim()}
                          sx={{ minWidth: '140px' }}
                        >
                          {isFeedbackLoading ? 'Processing...' : 'Send Feedback'}
                        </Button>
                      </Box>
                    </Box>
                  </div></>

                )}
              </Card>
            </Box>
            {/* Settings sidebar */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', mt: '1rem' }}>
              {/* SEO settings */}
              <Typography variant="h5">SEO Settings</Typography>

              <TextField
                multiline
                fullWidth
                label="Long tail keyword"
                disabled={!isEditing}
                variant="standard"
                value={longTailKeyword}
                onChange={(e) => setLongTailKeyword(e.target.value)}
                autoFocus
              />

              <TextField
                multiline
                fullWidth
                label="SEO Title"
                disabled={!isEditing}
                variant="standard"
                value={seoTitleTag}
                onChange={(e) => setSeoTitleTag(e.target.value)}
                autoFocus
              />

              <TextField
                multiline
                fullWidth
                label="SEO Meta Description"
                disabled={!isEditing}
                variant="standard"
                value={seoMetaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                autoFocus
              />

              <TextField
                fullWidth
                label="SEO Slug"
                disabled={!isEditing}
                variant="standard"
                value={seoSlug}
                inputRef={seoSlugInputRef} // Attach ref to track cursor position
                onKeyDown={(e) => handleKeyDown(e, setSeoSlug, seoSlugCursorRef)}
                onChange={(e) => handleSeoSlugChange(e, setSeoSlug, seoSlugCursorRef)}
                autoFocus
              />
              {/* SEO Checklist */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', mt: '1rem' }}>
                {/* SEO Checklist */}
                <Typography variant="h5">SEO Checklist</Typography>
                <List>
                  {checklist.map((item, index) => (
                    <ListItem key={item} sx={{ display: "block" }}>
                      <Box
                        onMouseEnter={() => setSeoCheckListHoveredIndex(index)}
                        onMouseLeave={() => setSeoCheckListHoveredIndex(null)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          padding: "10px",
                          width: "100%",
                          cursor: "pointer",
                          borderRadius: "8px",
                          transition: "background 0.2s",
                          "&:hover": { backgroundColor: "#f0f0f0" }, // Light background on hover
                        }}
                      >
                        <FormControlLabel
                          key={item}
                          control={
                            <Checkbox
                              checked={checkedItems.includes(item)}
                              disabled
                            />
                          }
                          label={
                            <Typography
                              sx={{ color: checkedItems.includes(item) ? "gray" : "black", cursor: "pointer" }}
                            >
                              {item}
                            </Typography>
                          }
                        />
                      </Box>
                      {/* Hover explanation directly under the item */}
                      {seoCheckListHoveredIndex === index && (
                        <Typography
                          sx={{
                            mt: 1,
                            p: 1,
                            backgroundColor: "#f5f5f5",
                            borderRadius: 2,
                            border: "1px solid #ddd",
                            fontSize: "0.9rem",
                            color: "#555"
                          }}
                        >
                          {check_list_explanation[index]}
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Box>
        </Box>
      </DashboardContent>
    </>
  );
}
