import { useState } from "react";
import {
    LineChart,
    lineElementClasses,
    markElementClasses,
} from "@mui/x-charts/LineChart";
import {
    CurveType,
    LineChartProps,
    mangoFusionPalette
} from "@mui/x-charts";
import {
    Stack,
    TextField,
    Switch,
    FormControl,
    FormControlLabel
} from '@mui/material';
import GenericSelector from "src/components/selector/generic-selector";
import dayjs, {Dayjs} from 'dayjs';

const customize = {
    height: 400,
    legend: {
        hidden: false,
        position: {
            vertical: 'top' as any,
            horizontal: 'middle' as any,
        },
        direction: 'row' as any,
        itemGap: 3,
    },
    margin: {
        top: 50,
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
    return `${yearString}-${monthString}-${dateString}`;
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

export function getDatesRange (startDate: string | undefined, endDate: string | undefined) {
    const dates = [];
    const dayIncrements = 24 * 3600 * 1000;
    const formattedStartDate = new Date(startDate as string);
    const formattedEndDate = new Date(endDate as string);
    for (let date = formattedStartDate.getTime(); date <= formattedEndDate.getTime(); date += dayIncrements){
        dates.push(date);
    }
    return dates;
}

interface CustomLineChartProps {
    legends?: string[];
    xLabels?: string[];
    series?: number[][];
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

    const mockLegends = legends || ["pillar-A", "pillar-B", "pillar-C", "pillar-D", "pillar-E"];
    const displayX = xLabels || ["2024-01-10", "2024-01-11", "2024-01-12", "2024-01-13", "2024-01-14"];
    const displaySeries = series || [
        [0, 2, 5, 6, 10],
        [1, 4, 6, 10, 15],
        [2, 6, 9, 25, 1],
        [0, 2, 5, 6, 10],
        [1, 5, 3, 17, 32]
    ];

    const yTicksSet = [... new Set(series?.flat())];

    const sortedXData = displayX.sort((a, b) => Date.parse(a) - Date.parse(b));

    const displayLineColors = getColors(mockLegends, style?.lineColors);

    const datasetReformated = displaySeries.map((byDate, yIndex) => {
        const perLabelCount = Object.fromEntries(byDate?.map((count, legendIndex) =>
            [mockLegends[legendIndex], count])
        );
        return { xValue: new Date(sortedXData[yIndex]), ...perLabelCount };
    });

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
                        valueFormatter: (value) => secondsToYearMonthDay(value),
                        min: new Date(sortedXData[0]),
                        max: new Date(sortedXData.slice(-1)[0]),
                        tickInterval: [new Date(sortedXData[0]), new Date(sortedXData.slice(-1)[0])]
                    },
                ]}
                yAxis={[
                    {
                        id: 'yValue',
                        scaleType: 'linear',
                        label: 'Views',
                        tickInterval: yTicksSet,
                        valueFormatter: (yValue) => yValue.toString()
                    },
                ]}
                series={mockLegends.map((labelItem) => ({
                    curve: chosenLineType,
                    dataKey: labelItem,
                    label: `${labelItem}`,
                    // color: displayLineColors[labelItem],
                    showMark: false,
                    ...(style?.isStacked ? stackStrategy : undefined),
                }))}
                dataset={datasetReformated}
                {...(style?.otherConfiguration || customize)}
            />
        </Stack >
    );
}