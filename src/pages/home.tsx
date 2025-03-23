import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import { CircularProgress } from '@mui/material';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { AddPillarModal } from 'src/components/modal/add-pillar-modal';

import { PillarCardItem } from 'src/sections/pillar/pillar-card-item';

import { 
  useGetAllPillarQuery,
  useCreatePillarMutation
} from '../libs/service/pillar/home';

// ----------------------------------------------------------------------

export default function Page() {
  const [allPillars, setAllPillars] = useState<any[]>([]);
  const { data: allPillarsData, isLoading, refetch } = useGetAllPillarQuery();
  
  useEffect(() => {
    if (!isLoading && allPillarsData) {
      setAllPillars(allPillarsData.data || []);
    }
  }, [isLoading, allPillarsData]);

  const router = useRouter();
  const handleWhatsOnMyMind = () => {
    router.push("/create");
  };
  const [createPillar, { isLoading : createPillarIsLoading }] = useCreatePillarMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmClicked, setIsConfirmClicked] = useState(true);
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
        <Box display="flex" alignItems="center" mb='2rem' gap='0.5rem'>
          <Typography variant="h4" flexGrow={1}>
          Strategy
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size='large'
            startIcon={<Iconify icon="hugeicons:idea-01" />}
            sx={{ fontSize: '1rem' }}
            onClick={handleWhatsOnMyMind}
          >
            New Content
          </Button>

          <Button
            variant="contained"
            color="inherit"
            size='large'
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ fontSize: '1rem' }}
            onClick={() => {
              setIsModalOpen(true);
              setIsConfirmClicked(false);
            }}
          >
            New Pillar
          </Button>
          <AddPillarModal 
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAddItem={handleAddItem}
            isLoading={isConfirmClicked}
            // modalTitle="Add Pillar"
            // textFieldText="Pillar Name"
            // buttonText="Add"
          />
        </Box>

        <Grid container spacing='1rem'>
          {isLoading ? (
            <Grid xs={12} flex={1} display="flex" alignItems="center" justifyContent="center" gap='2rem'>
              <CircularProgress color='inherit'/>
              <Typography>Fetching pillars...</Typography>
            </Grid>
          ) : allPillars?.length ? (
            [...allPillars]
            .sort((a, b) => {
              // First, sort by is_active (active pillars first)
              if (a.is_active !== b.is_active) {
                return a.is_active === true ? -1 : 1;
              }
              // Then, sort by created_at if is_active is the same
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            })
            .map((pillar: any) => (
              <Grid key={pillar.id} xs={12} sm={12} md={12}>
                <PillarCardItem 
                  product={pillar}
                  onClick={() => router.push(`/pillar/${pillar.id}`)}
                />
              </Grid>
            ))
          ) : (
            <Grid xs={12} flex={1} display="flex" alignItems="center" justifyContent="center" gap='2rem'>
              <Typography color="text.secondary">Waiting for your first pillar.</Typography>
            </Grid>
          )}
        </Grid>

      </DashboardContent>
    </>
  );
}
