import React from "react";
import { 
    LocalizationProvider, 
    MobileDatePicker,
} from '@mui/x-date-pickers';
import { 
    Box, 
    Typography 
} from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface DateRangePickerProps{
    startDate: Dayjs | null;
    endDate?: Dayjs | null;
    setStartDate: React.Dispatch<React.SetStateAction<Dayjs | null>>;
    setEndDate: React.Dispatch<React.SetStateAction<Dayjs | null>>;
}

export function DateRangePicker({
    startDate,
    endDate,
    setStartDate,
    setEndDate
}: DateRangePickerProps) {
    return (
        <>
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
                    defaultValue={dayjs()}
                    value={endDate}
                    onChange={(endValue) => setEndDate(endValue)}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </Box>
        </>
    )
};
