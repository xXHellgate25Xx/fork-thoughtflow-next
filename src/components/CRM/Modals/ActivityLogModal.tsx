import { Box, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Button as MuiButton, Select, TextField } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFetchStageQuestions } from 'src/hooks/useSurveys';
import { formatSurveyResponses } from 'src/libs/utils/surveyResponseUtil';
import type { ActivityLogRecord, OpportunitiesRecord, PipelineStageActivitiesRecord, SurveyQuestionsRecord, TeamMembersRecord } from 'src/types/mapAirtableTypes';
import SurveySection from '../Surveys/SurveySection';

interface ActivityLogModalProps {
    open: boolean;
    onClose: () => void;
    selectedOpportunity: Partial<OpportunitiesRecord> | null;
    stageLabels: Record<string, string>;
    stageActivitiesLabels: Record<string, Record<string, string>>;
    stageActivityIds: Record<string, string>;
    stageActivities: Partial<PipelineStageActivitiesRecord>[];
    onSubmit: (formValues: Partial<ActivityLogRecord & {
        surveyId?: string;
        surveyResponses?: string;
    }>) => Promise<void>;
    isLoading: boolean;
    owners: Partial<TeamMembersRecord>[];
}

const ActivityLogModal = ({
    open,
    onClose,
    selectedOpportunity,
    stageLabels,
    stageActivitiesLabels,
    stageActivityIds,
    stageActivities,
    onSubmit,
    isLoading,
    owners
}: ActivityLogModalProps) => {
    // Local state for the form values
    const [localFormValues, setLocalFormValues] = useState<Partial<ActivityLogRecord>>(() => ({
        Opportunity: selectedOpportunity?.id || '',
        "Created": new Date().toISOString().split('T')[0],
        "Current Stage": selectedOpportunity?.Stage?.[0] || '',
        "New Stage": '',
        "Next Contact Date": '',
        "Close Probability by Salesperson": 0,
        "Notes": '',
        "Stage Activity": '',
        "Assigned To": selectedOpportunity?.Owner?.[0] || '',
    }));

    // Reset form values when modal opens with different opportunity
    const { fetchStageQuestions, isLoading: isLoadingQuestions, error: questionsError } = useFetchStageQuestions();
    const [surveyState, setSurveyState] = useState({
        questions: [] as Partial<SurveyQuestionsRecord>[],
        hasAnySurvey: false,
        surveyId: undefined as string | undefined,
        responses: {} as Record<string, string>
    });

    // Remove individual loading states
    const [isApplyingChanges, setIsApplyingChanges] = useState(false);

    // Cache for survey questions by stage
    const [questionCache, setQuestionCache] = useState<Record<string, {
        questions: Partial<SurveyQuestionsRecord>[];
        hasAnySurvey: boolean;
        surveyId: string | undefined;
        timestamp: number;
    }>>({});

    const stageActivitiesById = useMemo(() => stageActivities.reduce((acc, activity) => {
        if (activity.id) {
            acc[activity.id] = activity;
        }
        return acc;
    }, {} as Record<string, Partial<PipelineStageActivitiesRecord>>), [stageActivities]);

    // Cache expiration time (5 minutes)
    const CACHE_EXPIRATION = 5 * 60 * 1000;

    const fetchAndCacheQuestions = useCallback(async (activityStageId: string) => {
        // Check cache first
        const cachedData = questionCache[activityStageId];
        const now = Date.now();

        if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRATION) {
            setSurveyState(prev => ({
                ...prev,
                questions: cachedData.questions,
                hasAnySurvey: cachedData.hasAnySurvey,
                surveyId: cachedData.surveyId
            }));
            return;
        }

        try {
            const result = await fetchStageQuestions(stageActivityIds[activityStageId]);
            // Update cache
            setQuestionCache(prev => ({
                ...prev,
                [activityStageId]: {
                    ...result,
                    timestamp: now
                }
            }));

            setSurveyState(prev => ({
                ...prev,
                questions: result.questions,
                hasAnySurvey: result.hasAnySurvey,
                surveyId: result.surveyId
            }));
        } catch (error) {
            console.error('❌ Failed to fetch survey questions:', error);
        }
    }, [fetchStageQuestions, stageLabels, questionCache, CACHE_EXPIRATION]);

    useEffect(() => {
        if (open) {
            setLocalFormValues({
                Opportunity: selectedOpportunity?.id || '',
                "Created": new Date().toISOString().split('T')[0],
                "Current Stage": selectedOpportunity?.Stage?.[0] || '',
                "New Stage": '',
                "Next Contact Date": '',
                "Close Probability by Salesperson": 0,
                "Notes": '',
                "Stage Activity": '',
                "Assigned To": selectedOpportunity?.Owner?.[0] || '',
            });
            // Clear any previous errors and survey state
            setErrors({});
            setSurveyState({
                questions: [],
                hasAnySurvey: false,
                surveyId: undefined,
                responses: {}
            });
        }
    }, [open, selectedOpportunity]);

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Add a ref to store the trigger element
    const triggerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (open) {
            // Store the currently focused element as the trigger
            triggerRef.current = document.activeElement as HTMLElement;
        }
    }, [open]);

    // Custom close handler to return focus
    const handleCloseWithFocus = useCallback(() => {
        // Return focus to the trigger element BEFORE closing the modal
        if (triggerRef.current) {
            triggerRef.current.focus();
        }
        onClose();
    }, [onClose]);

    // Local handlers
    const handleLocalInputChange = async (field: keyof typeof localFormValues, value: any) => {

        if (field === 'New Stage') {
            setLocalFormValues(prev => ({
                ...prev,
                "Stage Activity": ''
            }));
        }
        setLocalFormValues(prev => ({
            ...prev,
            [field]: value
        }));


        // Clear survey responses and fetch new questions when stage changes
        if (field === 'Stage Activity') {
            setSurveyState(prev => ({ ...prev, responses: {} }));
            await fetchAndCacheQuestions(value);
        }

        // Clear error for the field being changed
        setErrors(prev => ({
            ...prev,
            [field]: ''
        }));
    };

    const handleSurveyResponse = async (questionId: string | undefined, label: string, response: string) => {
        if (!questionId) return;

        setIsApplyingChanges(true);

        setSurveyState(prev => ({
            ...prev,
            responses: { ...prev.responses, [questionId]: `${response}` }
        }));

        setIsApplyingChanges(false);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!localFormValues["New Stage"]) {
            newErrors["New Stage"] = 'New Stage is required';
        }
        if (!localFormValues["Assigned To"]) {
            newErrors["Assigned To"] = 'Assigned To is required';
        }
        if (!localFormValues["Stage Activity"]) {
            newErrors["Stage Activity"] = 'Stage Activity is required';
        }

        // Remove survey validation since questions are optional

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
            filteredFormValues.surveyId = surveyState.surveyId;

            // Only add survey responses if there are questions and at least one response
            if (surveyState.questions.length > 0 && surveyState.surveyId && Object.keys(surveyState.responses).length > 0) {
                const formattedResponses = formatSurveyResponses(surveyState.questions, surveyState.responses);
                if (formattedResponses) {
                    filteredFormValues.surveyResponses = formattedResponses;
                }
            }

            await onSubmit(filteredFormValues);
        } catch (err) {
            console.error('Failed to create activity log:', err);
        }
    };

    // Get available stage activities for the selected stage
    const availableStageActivities = useMemo(() => {
        const filteredStageActivities = localFormValues["New Stage"] ? stageActivitiesLabels[localFormValues["New Stage"]] || {} : {};
        if (Object.keys(filteredStageActivities).length === 1) {
            handleLocalInputChange('Stage Activity', Object.keys(filteredStageActivities)[0]);
        }
        return filteredStageActivities;
    }, [localFormValues["New Stage"], stageActivitiesLabels]);

    return (
        <Dialog
            open={open}
            onClose={handleCloseWithFocus}
            maxWidth="md"
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
                        label="Current Stage"
                        value={stageLabels[selectedOpportunity?.Stage?.[0] || ''] || ''}
                        disabled
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    <FormControl fullWidth>
                        <InputLabel shrink>New Stage *</InputLabel>
                        <Select
                            value={localFormValues["New Stage"] || ''}
                            onChange={(e) => handleLocalInputChange('New Stage', e.target.value)}
                            displayEmpty
                            label="New Stage"
                            inputProps={{ 'aria-label': 'New Stage' }}
                            error={!!errors["New Stage"]}
                        >
                            {Object.entries(stageLabels)
                                .map(([value, label]) => (
                                    <MenuItem key={value} value={value}>
                                        {label}
                                    </MenuItem>
                                ))}
                        </Select>
                        {errors["New Stage"] && (
                            <div className="text-red-500 text-xs mt-1">{errors["New Stage"]}</div>
                        )}
                    </FormControl>


                    <FormControl fullWidth>
                        <InputLabel shrink>Stage Activity *</InputLabel>
                        <Select
                            value={localFormValues["Stage Activity"] || ''}
                            onChange={(e) => handleLocalInputChange('Stage Activity', e.target.value)}
                            displayEmpty
                            label="Stage Activity"
                            inputProps={{ 'aria-label': 'Stage Activity' }}
                            disabled={!localFormValues["New Stage"]}
                            required
                        >
                            {Object.entries(availableStageActivities).map(([id, text]) => (
                                <MenuItem key={id} value={id}>
                                    {text}
                                    {stageActivitiesById[id]?.Automated && <span className="text-xs mx-2 border border-green-800 bg-green-100 text-green-800  px-2 rounded-sm uppercase">Automated</span>}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors["Stage Activity"] && (
                            <div className="text-red-500 text-xs mt-1">{errors["Stage Activity"]}</div>
                        )}
                    </FormControl>

                    <SurveySection
                        newStage={localFormValues["New Stage"]}
                        stageLabels={stageLabels}
                        isLoadingQuestions={isLoadingQuestions}
                        questionsError={questionsError}
                        surveyState={surveyState}
                        errors={errors}
                        onSurveyResponse={handleSurveyResponse}
                        isApplyingChanges={isApplyingChanges}
                    />
                    <FormControl fullWidth>
                        <InputLabel shrink>Assigned To *</InputLabel>
                        <Select
                            value={localFormValues["Assigned To"] || ''}
                            onChange={(e) => handleLocalInputChange('Assigned To', e.target.value)}
                            displayEmpty
                            label="Assigned To"
                            inputProps={{ 'aria-label': 'Assigned To' }}
                            required
                        >
                            {owners.map((owner) => (
                                <MenuItem key={owner.id} value={owner.id}>
                                    {owner['Full Name']}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors["Assigned To"] && (
                            <div className="text-red-500 text-xs mt-1">{errors["Assigned To"]}</div>
                        )}
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel shrink>Close Probability (%)</InputLabel>
                        <Select
                            value={localFormValues["Close Probability by Salesperson"] || ''}
                            onChange={(e) => handleLocalInputChange('Close Probability by Salesperson', e.target.value)}
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
                        {errors["Close Probability by Salesperson"] && (
                            <div className="text-red-500 text-xs mt-1">{errors["Close Probability by Salesperson"]}</div>
                        )}
                    </FormControl>

                    <TextField
                        label="Next Contact Date"
                        type="date"
                        fullWidth
                        value={localFormValues["Next Contact Date"] || ''}
                        onChange={(e) => handleLocalInputChange('Next Contact Date', e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        error={!!errors["Next Contact Date"]}
                        helperText={errors["Next Contact Date"]}
                    />

                    <TextField
                        label="Notes"
                        multiline
                        rows={4}
                        fullWidth
                        required={['rec2LE93oDi5jf8ei', 'recJswG7wMvNozrvm'].includes(localFormValues["New Stage"])}
                        value={localFormValues.Notes || ''}
                        onChange={(e) => handleLocalInputChange('Notes', e.target.value)}
                        error={!!errors.Notes}
                        helperText={errors.Notes}
                    />

                    <TextField
                        label="Created"
                        type="date"
                        fullWidth
                        value={localFormValues.Created || ''}
                        disabled
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <MuiButton onClick={(e) => {
                    e.preventDefault();
                    handleCloseWithFocus();
                }}>Cancel</MuiButton>
                <MuiButton variant="contained" color="primary" onClick={(e) => {
                    e.preventDefault();
                    handleLocalSave();
                }} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Activity'}
                </MuiButton>
            </DialogActions>
        </Dialog>
    );
};

export default ActivityLogModal;