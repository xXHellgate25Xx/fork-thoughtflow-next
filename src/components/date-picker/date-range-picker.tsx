import type { Dayjs } from 'dayjs';

import React from "react";

import { 
    Box, 
    Typography 
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { 
    MobileDatePicker, 
    LocalizationProvider,
} from '@mui/x-date-pickers';

interface DateRangePickerProps{
    startDate: Dayjs | null;
    endDate?: Dayjs | null;
    setStartDate: React.Dispatch<
      React.SetStateAction<Dayjs | null>
    > | ((date: Dayjs | null) => void);
    setEndDate: React.Dispatch<
      React.SetStateAction<Dayjs | null>
    > | ((date: Dayjs | null) => void);
}

export function DateRangePicker({
    startDate,
    endDate,
    setStartDate,
    setEndDate
}: DateRangePickerProps) {
    return (
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
                    value={startDate}
                    onChange={(startValue) => setStartDate(startValue)}
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
                    value={endDate}
                    onChange={(endValue) => setEndDate(endValue)}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </Box>
    )
};
