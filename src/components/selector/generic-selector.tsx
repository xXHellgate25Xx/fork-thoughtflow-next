import type {
    SelectChangeEvent} from '@mui/material';

import { useState, useEffect } from 'react';

import {
    Select,
    MenuItem,
    InputLabel,
    FormControl
} from '@mui/material';


interface SelectorProps {
    topLabel?: string;
    optionsList?: (string | number)[];
    labelId?: string;
    id?: string;
    label?: string;
    currentChoice: string | number;
    setChoice: React.Dispatch<React.SetStateAction<any>>;
    labelStyle?: any;
    dropboxStyle?: any
}

const GenericSelector: React.FC<SelectorProps> = ({
    label,
    optionsList,
    labelId,
    currentChoice,
    setChoice,
    labelStyle,
    dropboxStyle
}) => {

    const [options, setOptions] = useState<Array<string | number> | undefined>([]);

    useEffect(() => {
        setOptions(optionsList);
    }, [optionsList])

    const handleSelection = (event: SelectChangeEvent) => {
        setChoice(event.target.value);
    };


    return (
        <>
            {/* Right side: Top Count Dropdown */}
            <FormControl size="small" sx={labelStyle||{ minWidth: 100 }}>
                <InputLabel id={labelId}>{label}</InputLabel>
                <Select
                    labelId={labelId}
                    id={`${labelId}-selector`}
                    value={String(currentChoice)}
                    label={label}
                    onChange={handleSelection}
                    sx={dropboxStyle}
                >
                    {options?.map((item) => (
                        <MenuItem value={`${item}`}>{`${item}`}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </>
    )
};

export default GenericSelector;