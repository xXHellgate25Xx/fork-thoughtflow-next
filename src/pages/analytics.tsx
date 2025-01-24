import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { useState, useCallback, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { ChannelSelect } from 'src/sections/analytics/channel-select';
import { Box, Card, CircularProgress } from '@mui/material';
import { ViewPieChart } from 'src/sections/analytics/pie-chart';
import Grid from '@mui/material/Grid';
import { SelectMenu } from 'src/sections/analytics/agg-time-select';
import { Icon } from '@iconify/react';
import LeaderboardTable from 'src/sections/analytics/leaderboard';


import { 
  useGetAllChannelsOfUserQuery,
  useGetAllStatsOfUserQuery,
  useGetAnalyticsViewByContentPillarQuery,
} from 'src/libs/service/analytics/analytics';
import dayjs from 'dayjs';

// ----------------------------------------------------------------------

export default function Page() {
  const [channel, setChannel] = useState<string>('1');
  const [aggTime, setAggTime] = useState<string>('daily');
  const [totalViews, setTotalViews] = useState<number>(0);
  const [diff, setDiff] = useState<number>(0);
  const currentDate = dayjs().format('YYYY-MM-DD');  

  // const totalViewsByPillar = [
  //   { id: 0, value: 10, label: 'series A' },
  //   { id: 1, value: 15, label: 'series B' },
  //   { id: 2, value: 20, label: 'series C' },
  // ]

  const aggTimeOptions = [
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' },
  ]

  const { data: allChannels, isLoading: allChannelsIsLoading} = useGetAllChannelsOfUserQuery();
  const channel_id = allChannels?.data[0].id;
  
  const {data : dailyStat, isLoading: dailyIsLoading} = useGetAllStatsOfUserQuery({
    channel_id,
    type_of_agg: 'day',
    current_date: currentDate,
  });
  const {data : weeklyStat, isLoading: weeklyIsLoading} = useGetAllStatsOfUserQuery({
    channel_id,
    type_of_agg: 'week',
    current_date: currentDate,
  });
  const {data : monthlyStat, isLoading: monthlyIsLoading} = useGetAllStatsOfUserQuery({
    channel_id,
    type_of_agg: 'month',
    current_date: currentDate,
  });
  console.log("Weekly Stat", weeklyStat);
  const { data: analyticsViewByContent, isLoading: analyticsViewByContentIsLoading} = useGetAnalyticsViewByContentPillarQuery();

  const mapContentArray = (inputs: any[]): any[] =>
      inputs.map((input) => ({
        id: input.pillar_id,
        value: input.views,
        label: input.pillar_name,
      }));
  const totalViewsByPillar = analyticsViewByContent?.data ? mapContentArray(analyticsViewByContent!.data) : [];
  
  // useEffect(() => {
  //   if (dailyStat) {
  //     setTotalViews(dailyStat.t1Views);
  //     setDiff(dailyStat.percentage_change);
  //   }
  // }, [dailyStat]);

  const onChosen = useCallback((newSelect: string) => {
    setAggTime(newSelect);
    switch (newSelect) {
      case 'daily':
        setTotalViews(dailyStat?.t1Views);
        setDiff(dailyStat?.percentage_change);
        break
      case 'weekly':
        setTotalViews(weeklyStat?.t1Views);
        setDiff(weeklyStat?.percentage_change);
        break
      case 'monthly':
      default:
        setTotalViews(monthlyStat?.t1Views);
        setDiff(monthlyStat?.percentage_change);
        break
    }
  }, [dailyStat, weeklyStat, monthlyStat]);

  return (
    <>
      <Helmet>
        <title> {`Analytics - ${CONFIG.appName}`}</title>
      </Helmet>
      <DashboardContent maxWidth="xl">
        <Box display="flex" alignItems="center" mb='2rem' gap='2rem'>
          <Typography variant="h4">
            Analytics
          </Typography>
        </Box> 

        <Box display="flex" mb='2rem' gap='1rem'>
          <Card sx={{ padding: '2rem', width: 'auto' }}>
            <Box display="flex" alignItems='center' gap='2rem' mb='2rem'>
              <Typography variant="h6">Total views</Typography>
              <SelectMenu itemId={aggTime} options={aggTimeOptions} onChosen={onChosen} />
            </Box>
            
            {dailyIsLoading && weeklyIsLoading && monthlyIsLoading? 
              <Box display="flex" justifyContent='center'>
                <CircularProgress color='inherit'/>
              </Box>
              :
              <Box display="flex" alignItems='center' justifyContent='center' flexDirection='column'>
                <Typography variant='h3'>
                  {new Intl.NumberFormat('en-GB').format(totalViews)}
                </Typography>

                <Box display="flex" alignItems='center'>
                
                  <Icon 
                    color={diff > 0 ? 'green' : 'red'}
                    icon={diff > 0 ? 'iconamoon:trend-up' : 'iconamoon:trend-down'}/>
                  <Typography color={diff > 0 ? 'green' : 'red'}>{diff > 0 ? '+' : ''}</Typography>
                  <Typography variant='subtitle1' color={diff > 0 ? 'green' : 'red'}>
                    {new Intl.NumberFormat('en-GB', { style: 'percent' }).format(diff)}
                  </Typography>
                </Box>
              </Box>
            }
          
          </Card>

          <ViewPieChart 
            title='Views by Content Pillars'
            data={totalViewsByPillar}/>
        </Box>

        <Box display="none" gap='1rem'>
          <Card sx={{ padding: '2rem', width: 'auto' }}>
            Line chart - view by pillars over date
          </Card>
          <Card sx={{ padding: '2rem', width: 'auto' }}>
            <LeaderboardTable
            // contentStats = dataFromApi
            // onClickRow={() => router.replace('/content/content-id')} // remember to import useRouter
            title = "Most viewed content"
          />
          </Card>
        </Box>
      </DashboardContent>
    </>
  );
}
