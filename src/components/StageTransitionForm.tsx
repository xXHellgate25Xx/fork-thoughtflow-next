import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React, { useCallback, useState } from 'react';
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
                <Grid item xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Estimated Close Date"
                            value={values.estimatedCloseDate}
                            onChange={(date) => handleChange('estimatedCloseDate', date)}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    margin: 'normal',
                                    variant: 'outlined',
                                },
                            }}
                        />
                    </LocalizationProvider>
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