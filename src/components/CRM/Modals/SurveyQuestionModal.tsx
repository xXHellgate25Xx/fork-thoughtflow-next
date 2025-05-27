import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useCreateSurveyQuestion, useUpdateSurveyQuestion } from 'src/hooks/tablehooks';
import { useSnackbar } from 'src/hooks/use-snackbar';
import { SurveyQuestionsRecord } from 'src/types/mapAirtableTypes';

interface SurveyQuestionModalProps {
    open: boolean;
    onClose: () => void;
    question: Partial<SurveyQuestionsRecord> | null;
}

const QUESTION_TYPES = [
    'Multiple Choice',
    'Text',
    'Number',
    'Yes/No'
];

export default function SurveyQuestionModal({ open, onClose, question }: SurveyQuestionModalProps) {
    const { showSnackbar } = useSnackbar();
    const [formValues, setFormValues] = useState<Partial<SurveyQuestionsRecord>>({
        Question: '',
        Type: '',
        Choices: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createMutation = useCreateSurveyQuestion();
    const updateMutation = useUpdateSurveyQuestion();

    useEffect(() => {
        if (open && question) {
            setFormValues({
                Question: question.Question || '',
                Type: question.Type || '',
                Choices: question.Choices || ''
            });
        } else if (open) {
            setFormValues({
                Question: '',
                Type: '',
                Choices: ''
            });
        }
        setErrors({});
    }, [open, question]);

    const handleInputChange = (field: string, value: string) => {
        setFormValues(prev => ({
            ...prev,
            [field]: value
        }));
        setErrors(prev => ({
            ...prev,
            [field]: ''
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formValues.Question) {
            newErrors.Question = 'Question is required';
        }
        if (!formValues.Type) {
            newErrors.Type = 'Question type is required';
        }
        if (formValues.Type === 'Multiple Choice' && !formValues.Choices) {
            newErrors.Choices = 'Choices are required for multiple choice questions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            if (question?.id) {
                await updateMutation.mutate(question.id, formValues);
                showSnackbar('Question updated successfully', 'success');
            } else {
                await createMutation.mutate(formValues);
                showSnackbar('Question created successfully', 'success');
            }
            onClose();
        } catch (error) {
            console.error('Failed to save question:', error);
            showSnackbar('Failed to save question', 'error');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                {question ? 'Edit Survey Question' : 'Add Survey Question'}
            </DialogTitle>
            <DialogContent>
                <Box className="space-y-4 mt-4">
                    <TextField
                        label="Question"
                        value={formValues.Question}
                        onChange={(e) => handleInputChange('Question', e.target.value)}
                        fullWidth
                        error={!!errors.Question}
                        helperText={errors.Question}
                        required
                    />

                    <FormControl fullWidth error={!!errors.Type}>
                        <InputLabel>Question Type *</InputLabel>
                        <Select
                            value={formValues.Type}
                            onChange={(e) => handleInputChange('Type', e.target.value)}
                            label="Question Type *"
                        >
                            {QUESTION_TYPES.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.Type && (
                            <div className="text-red-500 text-xs mt-1">{errors.Type}</div>
                        )}
                    </FormControl>

                    {formValues.Type === 'Multiple Choice' && (
                        <TextField
                            label="Choices (comma-separated)"
                            value={formValues.Choices}
                            onChange={(e) => handleInputChange('Choices', e.target.value)}
                            fullWidth
                            error={!!errors.Choices}
                            helperText={errors.Choices || 'Enter choices separated by commas'}
                            required
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleSave}>
                    {question ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
} 