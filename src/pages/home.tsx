import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { PillarCardItem } from 'src/sections/pillar/pillar-card-item';
import { _products } from 'src/_mock';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { DashboardContent } from 'src/layouts/dashboard';
import Grid from '@mui/material/Unstable_Grid2';
import { useRouter } from 'src/routes/hooks';


import { 
  useGetAllPillarQuery
} from '../libs/service/home';

// ----------------------------------------------------------------------

export default function Page() {
  const { data, error, isLoading } = useGetAllPillarQuery();
  const router = useRouter();
  const handleWhatsOnMyMind = () => {
    router.push("/ideas/create");
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {JSON.stringify(error)}</div>;

  return (
    <>
      <Helmet>
        <title> {`Home - ${CONFIG.appName}`}</title>
        <meta
          name="description"
          content="The starting point for your next project with Minimal UI Kit, built on the newest version of Material-UI ©, ready to be customized to your style"
        />
        <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />
      </Helmet>

      <DashboardContent>
        <Box display="flex" alignItems="center" justifyContent='center' mb={5} mt={5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ fontSize: '1.5rem', padding: '1rem 2rem' }}
            onClick={handleWhatsOnMyMind}
          >
            What&apos;s on your mind?
          </Button>
        </Box>

        <Box display="flex" alignItems="center" mb='2rem'>
          <Typography variant="h4" flexGrow={1}>
          Content Pillars
          </Typography>

          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ fontSize: '1rem' }}
          >
            New Pillar
          </Button>
        </Box>

        <Grid container spacing={3}>
          {data?.data?.length ? (
            data.data.map((pillar: any) => (
              <Grid key={pillar.id} xs={12} sm={6} md={3}>
                <PillarCardItem product={pillar} />
              </Grid>
            ))
          ) : (
            <Grid xs={12}>
              <Typography>No pillars found</Typography>
            </Grid>
          )}
        </Grid>

      </DashboardContent>
    </>
  );
}
