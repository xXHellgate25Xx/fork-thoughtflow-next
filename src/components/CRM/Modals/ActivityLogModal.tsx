import { Box, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Button as MuiButton, Select, TextField } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { OpportunitiesRecord } from 'src/types/airtableTypes';

interface ActivityLogModalProps {
    open: boolean;
    onClose: () => void;
    selectedOpportunity: Partial<OpportunitiesRecord> | null;
    statusLabels: Record<string, string>;
    stageExplanationLabels: Record<string, Record<string, string>>;
    onSubmit: (formValues: Record<string, any>) => Promise<void>;
    isLoading: boolean;
}

const ActivityLogModal = ({
    open,
    onClose,
    selectedOpportunity,
    statusLabels,
    stageExplanationLabels,
    onSubmit,
    isLoading
}: ActivityLogModalProps) => {
    // Local state for the form values
    const [localFormValues, setLocalFormValues] = useState<Record<string, any>>(() => ({
        prospectId: selectedOpportunity?.id || '',
        logDate: new Date().toISOString().split('T')[0],
        currentStage: selectedOpportunity?.['Current Stage (linked)']?.[0] || '',
        newStage: '',
        nextContactDate: '',
        closeProbability: selectedOpportunity?.['Close Probability'] || '',
        note: '',
        explanation: '',
    }));

    // Reset form values when modal opens with different opportunity
    useEffect(() => {
        if (open) {
            setLocalFormValues({
                prospectId: selectedOpportunity?.id || '',
                logDate: new Date().toISOString().split('T')[0],
                currentStage: selectedOpportunity?.['Current Stage (linked)']?.[0] || '',
                newStage: '',
                nextContactDate: '',
                closeProbability: selectedOpportunity?.['Close Probability'] || '',
                note: '',
                explanation: '',
            });
            // Clear any previous errors
            setErrors({});
        }
    }, [open, selectedOpportunity]);

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Local handlers
    const handleLocalInputChange = (field: string, value: any) => {
        setLocalFormValues(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for the field being changed
        setErrors(prev => ({
            ...prev,
            [field]: ''
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!localFormValues.newStage) {
            newErrors.newStage = 'New Stage is required';
        }
        if (!localFormValues.closeProbability) {
            newErrors.closeProbability = 'Close Probability is required';
        }
        // Require explanation for all stages
        if (!localFormValues.explanation) {
            newErrors.explanation = 'Explanation is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLocalSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            // Filter out empty values before submission
            const filteredFormValues = Object.entries(localFormValues).reduce((acc, [key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, any>);

            await onSubmit(filteredFormValues);
        } catch (err) {
            console.error('Failed to create activity log:', err);
        }
    };

    // Get available explanations for the selected stage
    const availableExplanations = useMemo(() => {
        const explanations = localFormValues.newStage ? stageExplanationLabels[localFormValues.newStage] || {} : {};
        if (Object.keys(explanations).length === 1) {
            handleLocalInputChange('explanation', Object.keys(explanations)[0]);
        }
        return explanations;
    }, [localFormValues.newStage, stageExplanationLabels]
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Create New Activity</DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        py: 2,
                    }}
                >
                    <TextField
                        label="Log Date"
                        type="date"
                        fullWidth
                        value={localFormValues.logDate || ''}
                        onChange={(e) => handleLocalInputChange('logDate', e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    <TextField
                        label="Current Stage"
                        value={statusLabels[selectedOpportunity?.['Current Stage (linked)']?.[0] || ''] || ''}
                        disabled
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    <FormControl fullWidth>
                        <InputLabel shrink>New Stage</InputLabel>
                        <Select
                            value={localFormValues.newStage || ''}
                            onChange={(e) => handleLocalInputChange('newStage', e.target.value)}
                            displayEmpty
                            label="New Stage"
                            inputProps={{ 'aria-label': 'New Stage' }}
                            error={!!errors.newStage}
                        >
                            {Object.entries(statusLabels)
                                .map(([value, label]) => (
                                    <MenuItem key={value} value={value}>
                                        {label}
                                    </MenuItem>
                                ))}
                        </Select>
                        {errors.newStage && (
                            <div className="text-red-500 text-xs mt-1">{errors.newStage}</div>
                        )}
                    </FormControl>

                    <FormControl fullWidth error={!!errors.explanation}>
                        <InputLabel shrink>Explanation *</InputLabel>
                        <Select
                            value={localFormValues.explanation || ''}
                            onChange={(e) => handleLocalInputChange('explanation', e.target.value)}
                            displayEmpty
                            label="Explanation"
                            inputProps={{ 'aria-label': 'Explanation' }}
                            disabled={!localFormValues.newStage}
                            required
                        >
                            {Object.entries(availableExplanations).map(([id, text]) => (
                                <MenuItem key={id} value={id}>
                                    {text}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.explanation && (
                            <div className="text-red-500 text-xs mt-1">{errors.explanation}</div>
                        )}
                    </FormControl>

                    <FormControl fullWidth error={!!errors.closeProbability}>
                        <InputLabel shrink>Close Probability (%)</InputLabel>
                        <Select
                            value={localFormValues.closeProbability || ''}
                            onChange={(e) => handleLocalInputChange('closeProbability', e.target.value)}
                            displayEmpty
                            label="Close Probability (%)"
                            inputProps={{ 'aria-label': 'Close Probability' }}
                        >
                            {Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map((value) => (
                                <MenuItem key={value} value={value / 100}>
                                    {value}%
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.closeProbability && (
                            <div className="text-red-500 text-xs mt-1">{errors.closeProbability}</div>
                        )}
                    </FormControl>

                    <TextField
                        label="Next Contact Date"
                        type="date"
                        fullWidth
                        value={localFormValues.nextContactDate || ''}
                        onChange={(e) => handleLocalInputChange('nextContactDate', e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        error={!!errors.nextContactDate}
                        helperText={errors.nextContactDate}
                    />

                    <TextField
                        label="Note"
                        multiline
                        rows={4}
                        fullWidth
                        required={['rec2LE93oDi5jf8ei', 'recJswG7wMvNozrvm'].includes(localFormValues.newStage)}
                        value={localFormValues.note || ''}
                        onChange={(e) => handleLocalInputChange('note', e.target.value)}
                        error={!!errors.note}
                        helperText={errors.note || (['rec2LE93oDi5jf8ei', 'recJswG7wMvNozrvm'].includes(localFormValues.newStage) ? 'Note is required for this new stage' : '')}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <MuiButton variant="text" onClick={onClose}>Cancel</MuiButton>
                <MuiButton variant="contained" color="primary" onClick={handleLocalSave} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Activity'}
                </MuiButton>
            </DialogActions>
        </Dialog>
    );
};

export default ActivityLogModal; 