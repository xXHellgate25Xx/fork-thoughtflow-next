// Import CSS for day picker
import 'react-day-picker/dist/style.css';

import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import * as Popover from '@radix-ui/react-popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import React, { useState, useCallback } from 'react';

import {
    Box,
    Grid,
    Button,
    Select,
    MenuItem,
    TextField,
    InputLabel,
    FormControl
} from '@mui/material';

import type { OpportunitiesRecord, Pipeline_StagesRecord } from '../types/supabase';

interface StageTransitionFormProps {
    opportunity: OpportunitiesRecord;
    pipelineStages: Pipeline_StagesRecord[];
    onSubmit: (values: {
        stageId: string;
        closeProbability: number;
        estimatedCloseDate: Date | null;
        comments: string;
    }) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

const StageTransitionForm = React.memo(({
    opportunity,
    pipelineStages,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: StageTransitionFormProps) => {
    // Find current stage
    const currentStage = pipelineStages.find(
        (stage) => stage.id === opportunity.stage_id
    );

    // Form state
    const [values, setValues] = useState({
        stageId: opportunity.stage_id || '',
        closeProbability: opportunity.close_probability || 0,
        estimatedCloseDate: opportunity.estimated_close_date
            ? new Date(opportunity.estimated_close_date)
            : null,
        comments: '',
    });

    // Handle field changes
    const handleChange = useCallback((field: string, value: any) => {
        setValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    // Handle form submission
    const handleSubmit = useCallback(() => {
        onSubmit(values);
    }, [onSubmit, values]);

    return (
        <Box component="form" sx={{ mt: 1 }}>
            <Grid container spacing={2}>
                {/* Current Stage (read-only) */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Current Stage"
                        value={currentStage?.name || 'Not set'}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        margin="normal"
                    />
                </Grid>

                {/* New Stage */}
                <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="new-stage-label">New Stage</InputLabel>
                        <Select
                            labelId="new-stage-label"
                            label="New Stage"
                            value={values.stageId}
                            onChange={(e) => handleChange('stageId', e.target.value)}
                        >
                            {pipelineStages.map((stage) => (
                                <MenuItem key={stage.id} value={stage.id}>
                                    {stage.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Close Probability */}
                <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="probability-label">Close Probability (%)</InputLabel>
                        <Select
                            labelId="probability-label"
                            label="Close Probability (%)"
                            value={values.closeProbability}
                            onChange={(e) => handleChange('closeProbability', Number(e.target.value))}
                        >
                            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => (
                                <MenuItem key={value} value={value}>
                                    {value}%
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Estimated Close Date */}
                <Grid item xs={12} sx={{ marginTop: 2 }}>
                    <Popover.Root>
                        <Popover.Trigger asChild>
                            <div style={{ position: 'relative' }}>
                                <TextField
                                    fullWidth
                                    label="Estimated Close Date"
                                    value={values.estimatedCloseDate
                                        ? format(values.estimatedCloseDate, 'PPP')
                                        : ''}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <CalendarIcon style={{
                                                position: 'absolute',
                                                right: 14,
                                                pointerEvents: 'none'
                                            }} />
                                        ),
                                    }}
                                    sx={{ cursor: 'pointer' }}
                                    variant="outlined"
                                    margin="normal"
                                />
                            </div>
                        </Popover.Trigger>
                        <Popover.Portal>
                            <Popover.Content
                                className="PopoverContent"
                                sideOffset={5}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                                    padding: '8px',
                                    zIndex: 1000
                                }}
                            >
                                <DayPicker
                                    mode="single"
                                    selected={values.estimatedCloseDate || undefined}
                                    onSelect={(date) => handleChange('estimatedCloseDate', date)}
                                    showOutsideDays
                                    className="date-picker"
                                />
                                <Popover.Arrow className="PopoverArrow" />
                            </Popover.Content>
                        </Popover.Portal>
                    </Popover.Root>
                </Grid>

                {/* Comments */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Comments"
                        multiline
                        rows={4}
                        value={values.comments}
                        onChange={(e) => handleChange('comments', e.target.value)}
                        margin="normal"
                        variant="outlined"
                        placeholder="Add any notes about this stage change..."
                    />
                </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button onClick={onCancel} variant="outlined" sx={{ mr: 1 }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </Box>
        </Box>
    );
});

export default StageTransitionForm; 