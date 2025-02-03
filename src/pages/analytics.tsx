import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { useState, useCallback, useEffect, useRef } from 'react';
import Typography from '@mui/material/Typography';
import { ChannelSelect } from 'src/sections/analytics/channel-select';
import { 
  DatePicker, 
  LocalizationProvider, 
  MobileDatePicker,
  DateField
 } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box, Card, CircularProgress } from '@mui/material';
import { ViewPieChart } from 'src/sections/analytics/pie-chart';
import Grid from '@mui/material/Grid';
import { CustomLineChart, getDatesRange, secondsToYearMonthDay } from 'src/sections/analytics/line-chart';
import { SelectMenu } from 'src/sections/analytics/agg-time-select';
import { Icon } from '@iconify/react';
import LeaderboardTable from 'src/sections/analytics/leaderboard';
import {
  useGetAllChannelsOfUserQuery,
  useGetAllStatsOfUserQuery,
  useGetAnalyticsViewByContentPillarQuery,
  useGetAllStatsOfUserByPillarQuery,
  useGetChannelStatsOfUserByPageQuery,
  useGetChannelStatsOfUserByPillarQuery,
  useGetTopContentQuery,
  useGetTopContentWeeklyQuery,
  useGetTopContentDailyQuery,
} from 'src/libs/service/analytics/analytics';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export default function Page() {
  const router = useRouter();
  const [channel, setChannel] = useState<string>('1');
  const [aggTime, setAggTime] = useState<string>('daily');
  const [totalViews, setTotalViews] = useState<number>(0);
  const [diff, setDiff] = useState<number>(0);
  const [pillarNames, setPillarNames] = useState<string[]>([]);
  const [pillarViews, setPillarViews] = useState<number[][]>([]);
  const [lineChartStartDate, setLineChartStartDate] = useState<Dayjs | null>(dayjs('2025-01-01'));
  const [lineChartEndDate, setLineChartEndDate] = useState<Dayjs | null>(dayjs());
  const formattedStartDate = lineChartStartDate?.format('YYYY-MM-DD') as string;
  const formattedCurrentDate = lineChartEndDate?.format('YYYY-MM-DD') as string;
  const datesRange = getDatesRange('2025-01-01', '2025-02-03');
  // getDatesRange(formattedStartDate, formattedCurrentDate);
  const datesRangeReformatted = datesRange.map((dateItem) => {
    const formattedDate = secondsToYearMonthDay(dateItem);
    return formattedDate;
  });

  const aggTimeOptions = [
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' },
  ]

  const {
    data: allChannels,
    isLoading: allChannelsIsLoading
  } = useGetAllChannelsOfUserQuery();

  const channel_id = allChannels?.data[0].id;

  const {
    data: channelStatsByPage,
    isLoading: channelStatsByPageIsLoading
  } = useGetChannelStatsOfUserByPageQuery(
    {
      channel_id,
      start_date: formattedStartDate,
      end_date: formattedCurrentDate
    },
    { skip: !channel_id }
  );

  const {
    data: channelStatsByPillar,
    isLoading: channelStatsByPillarIsLoading
  } = useGetChannelStatsOfUserByPillarQuery(
    {
      channel_id,
      start_date: lineChartStartDate?.format('YYYY-MM-DD') as string,
      end_date: lineChartEndDate?.format('YYYY-MM-DD') as string
    },
    { skip: !channel_id }
  );

  useEffect(() => {
    if (channelStatsByPillar) {
      const uniquePillarNames = [...new Set(channelStatsByPillar?.data?.map((item: any) => item.content_pillar))] as string[];
      const pillarProcessesByDates = datesRangeReformatted.map((date: string) => {
        const pillarFilteredByDates = channelStatsByPillar?.data?.filter((pillar: any) => pillar.date_id === date);
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
    channel_id,
    type_of_agg: 'day',
    current_date: formattedCurrentDate,
  });
  const { data: weeklyStat, isLoading: weeklyIsLoading } = useGetAllStatsOfUserQuery({
    channel_id,
    type_of_agg: 'week',
    current_date: formattedCurrentDate,
  });
  const { data: monthlyStat, isLoading: monthlyIsLoading } = useGetAllStatsOfUserQuery({
    channel_id,
    type_of_agg: 'month',
    current_date: formattedCurrentDate,
  });

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
  const topContent = useGetTopContentQuery();
  const mapTopContentArrayFromApi = (inputs: any[]): any[] =>
    inputs.map((input) => ({
      content_id: input.content_id,
      title: input.title,
      pillar: input.pillar,
      pageviews: input.pageviews,
    }));
  const topContentAllTime = topContent?.data?.data ? mapTopContentArrayFromApi(topContent!.data?.data) : [];

  const topContentDaily = [
    {
        "content_id": "67399025-ffef-411a-a966-8f1f91f77efb",
        "title": "Offshore Employee Engagement",
        "pillar": "High Performance Culture",
        "pageviews": 1
    },
    {
        "content_id": "e5d46189-25dd-4fb7-ab3e-22c6fea72e5e",
        "title": "Sora's out, but there is a long way to go",
        "pillar": "Tech-Forward Insights",
        "pageviews": 1
    }
  ]
  const topContentWeekly = [
    {
        "content_id": "67399025-ffef-411a-a966-8f1f91f77efb",
        "title": "Offshore Employee Engagement",
        "pillar": "High Performance Culture",
        "pageviews": 2
    },
    {
        "content_id": "e5d46189-25dd-4fb7-ab3e-22c6fea72e5e",
        "title": "Sora's out, but there is a long way to go",
        "pillar": "Tech-Forward Insights",
        "pageviews": 2
    }
  ]
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
          <Card sx={{ padding: '2rem', width: 800, display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="h6"
            > Views by pillars over time 
            </Typography>
            <Box
              sx={{
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                flexDirection: "row",
                gap: 1
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer
                  components={['MobileDatePicker']}
                  sx={{
                    display: 'flex', 
                    flexDirection: 'row',
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <MobileDatePicker
                    label="Start"
                    defaultValue={dayjs('2025-01-01')}
                    value={lineChartStartDate}
                    onChange={(startValue) => setLineChartStartDate(startValue)}
                  />
                </DemoContainer>
              </LocalizationProvider>
              <Typography> - </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer
                  components={['MobileDatePicker']}
                  sx={{
                    display: 'flex', 
                    flexDirection: 'row',
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <MobileDatePicker
                    label="End"
                    defaultValue={dayjs()}
                    value={lineChartEndDate}
                    onChange={(endValue) => setLineChartEndDate(endValue)}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </Box>
            <CustomLineChart
              legends={pillarNames}
              xLabels={datesRangeReformatted}
              series={pillarViews}
            />
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
        
        
          <ViewPieChart
              title='Views by Content Pillars'
              data={totalViewsByPillar} />
        </Box>
      </DashboardContent>
    </>
  );
}
