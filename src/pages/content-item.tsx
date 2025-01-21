import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { CONFIG } from 'src/config-global';
import { _products } from 'src/_mock';

import { Box, Button, Card, Typography } from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { Icon } from '@iconify/react';

// ----------------------------------------------------------------------

const channelIcons: { [key: string]: string } = {
  wix: 'simple-icons:wix',
  linkedin: 'devicon:linkedin',
  facebook: 'logos:facebook',
  instagram: 'skill-icons:instagram'
}

export default function Page() {
  const [published, setPublished] = useState(false);
  const [createdAt, setCreatedAt] = useState('2025-01-21 01:11PM');
  const [publishedAt, setPublishedAt] = useState('2025-01-21 01:11PM');
  const [views, setViews] = useState(1234);
  const [channelType, setChannelType] = useState('wix');

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
            <Icon icon='ep:back' width={30}/>
          </Button>
          <Icon icon={channelIcons[channelType]} width={30} height={30} />
          <Typography variant='h4'>
            Title of content post
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap='0.5rem'>
          <Box flexGrow={1}>
            <Typography>
              <b>Created at:</b> {createdAt}
            </Typography>
            <Typography display={published ? 'block' : 'none'}>
            <b>Published at:</b> {publishedAt}
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
            startIcon={<Icon icon="ic:baseline-publish" />}
          >
            Publish
          </Button>
          <Button
            sx={{ display: published ? 'flex' : 'none' }}
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
          >
            Repurpose
          </Button>
          <Button
            sx={{ display: published ? 'none' : 'flex' }}
            variant="outlined"
            color="inherit"
            startIcon={<Icon icon="akar-icons:edit" />}
          >
            Edit
          </Button>
          <Button
            sx={{ display: published ? 'none' : 'flex' }}
            variant="outlined"
            color="error"
            startIcon={<Icon icon="solar:archive-bold" />}
          >
            Archive
          </Button>
        </Box>

        <Card sx={{ mt: '1rem', padding: '1rem' }}>
          <div style={{ whiteSpace: 'pre-line' }}>
        {`Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
        Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, 
        when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
        It has survived not only five centuries, but also the leap into electronic typesetting, 
        remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset 
        sheets containing Lorem Ipsum passages, and more recently with desktop publishing software 
        like Aldus PageMaker including versions of Lorem Ipsum.\n
        Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of 
        classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, 
        a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, 
        consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, 
        discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 
        &quot;de Finibus Bonorum et Malorum&quot; (The Extremes of Good and Evil) by Cicero, written in 45 BC. 
        This book is a treatise on the theory of ethics, very popular during the Renaissance. 
        The first line of Lorem Ipsum, &quot;Lorem ipsum dolor sit amet..&quot;, comes from a line in section 1.10.32.`}
          </div>
        </Card>

      </DashboardContent>
    </>
  );
}
