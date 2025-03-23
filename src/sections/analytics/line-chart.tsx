import type {
    CurveType,
    LineChartProps} from "@mui/x-charts";

import dayjs from 'dayjs';
import { useState, useEffect } from "react";

import {
    mangoFusionPalette
} from "@mui/x-charts";
import {
    LineChart,
    lineElementClasses,
    markElementClasses,
} from "@mui/x-charts/LineChart";
import {
    Stack,
    Switch,
    TextField,
    FormControl,
    FormControlLabel,
} from '@mui/material';

import GenericSelector from "src/components/selector/generic-selector";

const customize = {
    height: 400,
    slotProps:{
        legend: {
            hidden: false,
            position: {
                vertical: 'top' as any,
                horizontal: 'middle' as any,
            },
            direction: 'row' as any,
            itemGap: 45,
            labelStyle: {
                fontSize: '0.7rem'
            },
        },
    },
    margin: {
        top: 130,
        right: 50,
        left: 50,
    },
};

const stackStrategy = {
    stack: 'total',
    area: true,
    stackOffset: 'none', // To stack 0 on top of others
} as const;

export const secondsToYearMonthDay = (seconds: number | Date) => {
    const dateString = new Date(seconds).getDate().toString().padStart(2, "0");
    const monthString = (new Date(seconds).getMonth() + 1).toString().padStart(2, "0");
    const yearString = new Date(seconds).getFullYear();
    return `${yearString}/${monthString}/${dateString}`;
};

export const integerToRgbString = (input: number) => {
    const binaryDigits = input.toString(2).split('').reverse();
    const newBinaryList = ["0", "0", "0"];
    const processedLists = newBinaryList.map((itemA, indexA) => {
        const processedDigit = binaryDigits.map((itemB, indexB) => {
            if (Math.abs(indexB - indexA) % 3 === 0) {
                return Math.floor(255 / ((indexB === 0 ? parseInt(itemB, 10) : indexB) + 1));
            }
            return 0;
        });
        return processedDigit.find((a) => a > 0) || 0;
    });

    const intToHexcode = `rgb(${processedLists[0]},${processedLists[1]},${processedLists[2]})`;
    return intToHexcode;
};

export const getColors = (labels: string[], customColors?: string[]): { [key: string]: string | undefined } => {
    const labelToColorSet = Object.fromEntries(labels.map((item, index) =>
        [item, customColors?.[index] || integerToRgbString(index)]
    ));
    return labelToColorSet;
};

export function getDatesRange (startDate: number | undefined, endDate: number | undefined) {
    const dates = [];
    const dayIncrements = 24 * 3600 * 1000;
    for (let date = startDate as number; date <= (endDate as number); date += dayIncrements){
        dates.push(date);
    }
    return dates;
}

interface CustomLineChartProps {
    legends: string[];
    xLabels: number[];
    series: number[][];
    style?: {
        lineType?: CurveType | undefined;
        markSize?: string;
        markStrokeWidth?: number | string;
        markFill?: string;
        lineColors?: string[];
        lineWidth?: number | string;
        isStacked?: boolean;
        showSettings?: boolean;
        withConfig?: boolean;
        otherConfiguration?: LineChartProps;
    }
};

export function CustomLineChart({ legends, xLabels, series, style }: CustomLineChartProps) {
    const [chosenLineType, setChosenLinetype] = useState<CurveType>(style?.lineType || "linear");
    const [markerSize, setMarkerSize] = useState<string | number>("1");
    const [markerStrokeWidth, setMarkerStrokeWidth] = useState<string | number>("2");
    const [lineWidth, setLineWidth] = useState<string | number>("2");
    const [stackStatus, setStackStatus] = useState<boolean>(style?.isStacked || false);
    const [isConfigEnabled, setIsConfigEnabled] = useState<boolean>(style?.withConfig || false);
    const [displayLegends, setDisplayLegends] = useState<string[]>([]);
    const [displayDataset, setDisplayDataset] = useState<{[x: string]: Date | string | number}[]>([]);
    const [yTicks, setYTicks] = useState<number[]>([]);
    const linesTypeOptions = [
        'catmullRom',
        'linear',
        'monotoneX',
        'monotoneY',
        'natural',
        'step',
        'stepBefore',
        'stepAfter'
    ];


    useEffect(()=>{
        if(legends && series && xLabels){
            
            const datasetReformated = series.map((byDate, yIndex) => {
                const perLabelCount = Object.fromEntries(byDate
                    ?.map((count, legendIndex) =>
                    [legends[legendIndex], count])
                );
                return { xValue: new Date(xLabels[yIndex]), ...perLabelCount };
            });
            // Clear data before resetting on time changes 
            // to avoid rendering error when calculating 
            // attribute d for line chart SVG <path> element
            setDisplayLegends([]);
            setDisplayDataset([]);
            setYTicks([]);
            setTimeout(()=> {
                setDisplayLegends(legends ?? []);
                setDisplayDataset(datasetReformated);
                setYTicks([... new Set(series?.flat())]);
            }, 0);
        }
    },[legends, series, xLabels]);

    // const displayLineColors = getColors(displayLegends, style?.lineColors);

    const handleStackChoice = (choice: string) => {
        setStackStatus(choice === "Stack");
    };

    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 2, ml: 2 }}
        >
            {!style?.showSettings?
            <></>:
            <FormControl>
                <FormControlLabel
                    control={
                        <Switch
                            checked={isConfigEnabled}
                            onChange={(event, checked) => { setIsConfigEnabled(checked) }}
                        />
                    }
                    label="Settings"
                    labelPlacement="bottom"
                />
            </FormControl>}


            {!isConfigEnabled ?
                <></>
                :
                <Stack
                    direction="column"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    sx={{ mb: 2, ml: 2, gap: 3 }}
                >
                    <GenericSelector
                        label="Line Type"
                        optionsList={linesTypeOptions}
                        labelId="lineType"
                        currentChoice={chosenLineType}
                        setChoice={setChosenLinetype}
                    />

                    <GenericSelector
                        label="Stack"
                        optionsList={["None", "Stack"]}
                        labelId="stackStatus"
                        currentChoice={stackStatus ? "Stack" : "None"}
                        setChoice={handleStackChoice}
                    />

                    <TextField
                        variant="outlined"
                        label="Marker size"
                        type="text"
                        value={markerSize}
                        onChange={(event) => { setMarkerSize(event.target.value) }}
                        sx={{
                            width: "60%",
                            fontSize: "body1.fontSize"
                        }}
                    />
                    <TextField
                        variant="outlined"
                        label="Marker border width"
                        type="text"
                        value={markerStrokeWidth}
                        onChange={(event) => { setMarkerStrokeWidth(event.target.value) }}
                        sx={{
                            width: "60%",
                            fontSize: "body1.fontSize"
                        }}
                    />
                    <TextField
                        variant="outlined"
                        label="Marker size"
                        type="text"
                        value={lineWidth}
                        onChange={(event) => { setLineWidth(event.target.value) }}
                        sx={{
                            width: "60%",
                            fontSize: "body1.fontSize"
                        }}
                    />
                </Stack>
            }

            <LineChart
                colors = {mangoFusionPalette}
                sx={{
                    [`& .${lineElementClasses.root}`]: {
                        strokeWidth: lineWidth,
                    },
                    [`& .${markElementClasses.root}`]: {
                        scale: markerSize,
                        fill: '#fff',
                        strokeWidth: markerStrokeWidth,
                        shape: "diamond"
                    },
                }}
                xAxis={[
                    {
                        dataKey: 'xValue',
                        scaleType: 'time',
                        valueFormatter: (value) => dayjs(value).format('YYYY-MM-DD'),
                        min: new Date(Math.min(...xLabels)),
                        max: new Date(Math.max(...xLabels)),
                        tickInterval: [new Date(xLabels[0]), new Date(xLabels.slice(-1)[0])]
                    },
                ]}
                yAxis={[
                    {
                        id: 'yValue',
                        scaleType: 'linear',
                        label: 'Views',
                        tickInterval: yTicks,
                        valueFormatter: (yValue) => yValue.toString()
                    },
                ]}
                series={displayLegends.map((labelItem) => ({
                    curve: chosenLineType,
                    dataKey: labelItem,
                    label: `${labelItem}`,
                    // color: displayLineColors[labelItem],
                    showMark: false,
                    ...(style?.isStacked ? stackStrategy : undefined),
                }))}
                dataset={displayDataset}
                {...(style?.otherConfiguration || customize)}
            />
        </Stack >
    );
}