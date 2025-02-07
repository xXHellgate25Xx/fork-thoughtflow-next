import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

import { 
  Box, 
  Card,
  CircularProgress, 
  Typography,
  Snackbar, 
  Alert, 
  AlertColor,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { ViewPieChart } from 'src/sections/analytics/pie-chart';
import Grid from '@mui/material/Grid';

import { DateRangePicker } from 'src/components/date-picker/date-range-picker';
import { CustomLineChart, getDatesRange } from 'src/sections/analytics/line-chart';
import { SelectMenu } from 'src/sections/analytics/agg-time-select';
import { ChannelSelect } from 'src/sections/channel/channel-select';
import LeaderboardTable from 'src/sections/analytics/leaderboard';

import {useGetAllChannelsOfUserQuery} from 'src/libs/service/channel/channel';
import {
  useGetAllStatsOfUserQuery,
  useGetAnalyticsViewByContentPillarQuery,
  useGetAllStatsOfUserByPillarQuery,
  useGetChannelStatsOfUserByPageQuery,
  useGetChannelStatsOfUserByPillarQuery,
  useGetTopContentQuery,
  useGetTopContentWeeklyQuery,
  useGetTopContentDailyQuery,
  AnalyticsPageApi
} from 'src/libs/service/analytics/analytics';
import store from 'src/libs/stores';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export default function Page() {
  const router = useRouter();
  const [channelId, setChannelId] = useState<string>('1');
  const [channelOptions, setChannelOptions] = useState<{id: string; name: string}[]>([]);
  const [aggTime, setAggTime] = useState<string>('daily');
  const [totalViews, setTotalViews] = useState<number>(0);
  const [diff, setDiff] = useState<number>(0);
  const [pillarNames, setPillarNames] = useState<string[]>([]);
  const [pillarViews, setPillarViews] = useState<number[][]>([]);
  const [lineChartStartDate, setLineChartStartDate] = useState<Dayjs | null>(dayjs('2025-01-01'));
  const [lineChartEndDate, setLineChartEndDate] = useState<Dayjs | null>(dayjs());
  const [datesRangeReformatted, setDatesRangeReformatted] = useState<number[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'error',
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(()=>{
    const millisecondStartDate = lineChartStartDate?.valueOf();
    const millisecondEndDate = lineChartEndDate?.valueOf();
    setDatesRangeReformatted(getDatesRange(millisecondStartDate, millisecondEndDate));
  },[lineChartStartDate, lineChartEndDate]);


  const aggTimeOptions = [
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' },
  ]

  const {
    data: allChannels,
    isLoading: allChannelsIsLoading
  } = useGetAllChannelsOfUserQuery();

  useEffect(()=>{
    if(allChannels){
      setChannelId(allChannels?.data?.[0]?.id);
      setChannelOptions(allChannels?.data
        ?.map((channel: any)=>{
          const reformattedChannel = { id: channel.id, name: channel.name };
          return reformattedChannel;
      }));
    }
  },[allChannels]);

  const handleSelectChannel = (chosenChannelId: string) => {
    setChannelId(chosenChannelId);
  };

  const {
    data: channelStatsByPage,
    isLoading: channelStatsByPageIsLoading
  } = useGetChannelStatsOfUserByPageQuery(
    {
      channel_id: channelId,
      start_date: lineChartStartDate?.format('YYYY-MM-DD') as string,
      end_date: lineChartEndDate?.format('YYYY-MM-DD') as string
    },
    {skip: !channelId}
  );

  const {
    data: channelStatsByPillar,
    isFetching: channelStatsByPillarIsFetching,
    refetch: channelStatsByPillarRefetch,
  } = useGetChannelStatsOfUserByPillarQuery(
    {
      channel_id: channelId,
      start_date: lineChartStartDate?.format('YYYY-MM-DD') as string,
      end_date: lineChartEndDate?.format('YYYY-MM-DD') as string
    },
    {skip: !channelId}
  );

  useEffect(() => {
    if (channelStatsByPillar) {
      const uniquePillarNames = [...new Set(channelStatsByPillar?.data?.map((item: any) => item.content_pillar))] as string[];
      const pillarProcessesByDates = datesRangeReformatted.map((date: number) => {
        const pillarFilteredByDates = channelStatsByPillar?.data?.filter((pillar: any) => dayjs(pillar.date_id).valueOf() === date);
        const pillarWithMatchedDate = uniquePillarNames.map((pillarName) => {
          let viewsPerpillar;
          const matchedPillar = pillarFilteredByDates.find((pillar: any) => pillar.content_pillar === pillarName);
          if (matchedPillar) {
            viewsPerpillar = matchedPillar.page_view;
          } else {
            viewsPerpillar = 0;
          }
          return viewsPerpillar;
        });
        return pillarWithMatchedDate;
      });
      setPillarNames(uniquePillarNames);
      setPillarViews(pillarProcessesByDates);
    }
  }, [channelStatsByPillar]);

  const { data: dailyStat, isLoading: dailyIsLoading } = useGetAllStatsOfUserQuery({
    channel_id: channelId,
    type_of_agg: 'day',
    current_date: dayjs().format('YYYY-MM-DD'),
  },{skip: !channelId});
  const { data: weeklyStat, isLoading: weeklyIsLoading } = useGetAllStatsOfUserQuery({
    channel_id: channelId,
    type_of_agg: 'week',
    current_date: dayjs().format('YYYY-MM-DD'),
  },{skip: !channelId});
  const { data: monthlyStat, isLoading: monthlyIsLoading } = useGetAllStatsOfUserQuery({
    channel_id: channelId,
    type_of_agg: 'month',
    current_date: dayjs().format('YYYY-MM-DD'),
  },{skip: !channelId});

  const {
    data: analyticsViewByContent,
    isLoading: analyticsViewByContentIsLoading
  } = useGetAnalyticsViewByContentPillarQuery();

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
  const { data: topContent } = useGetTopContentQuery();
  const mapTopContentArrayFromApi = (inputs: any[]): any[] =>
    inputs.map((input) => ({
      content_id: input.content_id,
      title: input.title,
      pillar: input.pillar,
      pageviews: input.pageviews,
    }));
  const topContentAllTime = useMemo(() => {
    if (topContent?.data) {
      return mapTopContentArrayFromApi(topContent.data);
    }
    return [];
  }, [topContent?.data]);

  const { data: topContentDailyApi } = useGetTopContentDailyQuery();
  const topContentDaily = useMemo(() => {
    if (topContentDailyApi?.data) {
      return mapTopContentArrayFromApi(topContentDailyApi.data);
    }
    return [];
  }, [topContentDailyApi?.data]);

  const { data: topContentWeeklyApi } = useGetTopContentWeeklyQuery();
  const topContentWeekly = useMemo(() => {
    if (topContentWeeklyApi?.data) {
      return mapTopContentArrayFromApi(topContentWeeklyApi.data);
    }
    return [];
  }, [topContentWeeklyApi?.data]);

  const [topContentTableAllData, setTopContentTableAllData] = useState<any>([]);
  const [currentTimeFilter, setCurrentTimeFilter] = useState<string>('all');

  useEffect(() => {
    updateTableData(currentTimeFilter);
  }, [topContentAllTime, topContentWeekly, topContentDaily, currentTimeFilter]);

  const updateTableData = (timeFilterType: string) => {
    setCurrentTimeFilter(timeFilterType);
    switch (timeFilterType) {
      case "daily":
        setTopContentTableAllData(topContentDaily);
        break;
      case "weekly":
        setTopContentTableAllData(topContentWeekly);
        break;
      case "all":
      default:
        setTopContentTableAllData(topContentAllTime);
        break;
    }
  };

  const handleSelectStartDate = (date: Dayjs | null) => {
    // Handle selecting start date the same or after current date 
    if(dayjs().isSame(date, 'day') || dayjs().isBefore(date)){
      setLineChartStartDate(dayjs(lineChartStartDate));
      setSnackbar({
        open: true,
        message: 'Start date should not be the same day or a day after the current date.',
        severity: 'warning'
      });
    } else {
      setLineChartStartDate(date);
    }
    // Clear Redux Store API Cache for analytics API 
    // and force re-fetch to get fresh data
    // to avoid SVG rendering error
    store.dispatch(AnalyticsPageApi.util.resetApiState());
    channelStatsByPillarRefetch();
  };

  const handleSelectEndDate = (date: Dayjs | null) => {
    // Handle selecting end date after current date
    if(dayjs().isBefore(date)){
      setLineChartEndDate(dayjs());
      setSnackbar({
        open: true,
        message: 'End date should not be a day after the current date.',
        severity: 'warning'
      });
    } else {
      setLineChartEndDate(date);
    }
    // setLineChartEndDate(dayjs().isBefore(date)? dayjs() : date);
    // Clear Redux Store API Cache for analytics API 
    // and force re-fetch to get fresh data
    // to avoid SVG rendering error
    store.dispatch(AnalyticsPageApi.util.resetApiState());
    channelStatsByPillarRefetch();
  };

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

            {dailyIsLoading && weeklyIsLoading && monthlyIsLoading ?
              <Box display="flex" justifyContent='center'>
                <CircularProgress color='inherit' />
              </Box>
              :
              <Box display="flex" alignItems='center' justifyContent='center' flexDirection='column'>
                <Typography variant='h3'>
                  {new Intl.NumberFormat('en-GB').format(totalViews)}
                </Typography>

                <Box display="flex" alignItems='center'>

                  <Icon
                    color={diff > 0 ? 'green' : 'red'}
                    icon={diff > 0 ? 'iconamoon:trend-up' : 'iconamoon:trend-down'} />
                  <Typography color={diff > 0 ? 'green' : 'red'}>{diff > 0 ? '+' : ''}</Typography>
                  <Typography variant='subtitle1' color={diff > 0 ? 'green' : 'red'}>
                    {new Intl.NumberFormat('en-GB', { style: 'percent' }).format(diff)}
                  </Typography>
                </Box>
              </Box>
            }

          </Card>
          <Card 
            sx={{ 
              padding: '2rem', 
              width: 800, 
              display: 'flex', 
              flexDirection: 'column',
            }}
          >
            <Typography
              variant="h6"
            > Views by pillars over time 
            </Typography>
            <ChannelSelect
                channelId={channelId}
                onSort={handleSelectChannel}
                options={channelOptions}
                sx={{
                  mt: 2,
                  mb: 1,
                  right: 0,
                  width: '60%'
                }}
            />
            <DateRangePicker
              startDate={lineChartStartDate}
              endDate={lineChartEndDate}
              setStartDate={handleSelectStartDate}
              setEndDate={handleSelectEndDate}
            />
            {channelStatsByPillarIsFetching?
            (
              <Box display="flex" alignItems="center" justifyContent="center" gap='2rem' sx={{p: 2}}>
                <CircularProgress color='inherit'/>
                  <Typography>Fetching pillars statistic...</Typography>
              </Box>
            ):
            <CustomLineChart
              legends={pillarNames}
              xLabels={datesRangeReformatted.sort((a, b) => a - b)}
              series={pillarViews}
            />}
          </Card>
          
        </Box>

        <Box display="flex" gap='1rem'>
          <Card sx={{ padding: '2rem', width: 'auto' }}>
            <LeaderboardTable
              contentStats = {topContentTableAllData}
            updateTableData={updateTableData}
              onClickRow={() => router.replace('/content/content-id')}
              title="Most viewed content"
            />
          </Card>
        
          <Card 
            sx={{ 
              padding: '2rem',
              width: '300',
              maxWidth: '100%', 
              mx: 'auto',  // Center the card
              p: 2,
              boxSizing: 'border-box',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}
          >
            <ViewPieChart
              title='Views by Content Pillars'
              data={totalViewsByPillar} />
          </Card>
        </Box>
      </DashboardContent>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
