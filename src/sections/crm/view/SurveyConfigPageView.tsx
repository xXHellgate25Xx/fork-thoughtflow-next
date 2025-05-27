import { Box, Button, Card, Typography } from '@mui/material';
import { memo, useCallback, useState } from 'react';
import SurveyQuestionModal from 'src/components/CRM/Modals/SurveyQuestionModal';
import { Iconify } from 'src/components/iconify';
import { LoadingFallback } from 'src/components/ui/loading-fallback';
import { useSurveyQuestions, useSurveys } from 'src/hooks/tablehooks';
import { SurveyQuestionsRecord } from 'src/types/mapAirtableTypes';


const SurveyConfigPageView = memo(() => {
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<Partial<SurveyQuestionsRecord> | null>(null);

    const { records: surveys, isLoading: surveysLoading } = useSurveys();
    const { records: questions, isLoading: questionsLoading } = useSurveyQuestions();

    const handleAddQuestion = useCallback(() => {
        setSelectedQuestion(null);
        setIsQuestionModalOpen(true);
    }, []);

    const handleEditQuestion = useCallback((question: SurveyQuestionsRecord) => {
        setSelectedQuestion(question);
        setIsQuestionModalOpen(true);
    }, []);

    if (surveysLoading || questionsLoading) {
        return <LoadingFallback />;
    }

    return (
        <Box className="p-6">
            <Box className="flex justify-between items-center mb-6">
                <Typography variant="h4">Survey Configuration</Typography>
                <Button
                    variant="contained"
                    startIcon={<Iconify icon="mdi:plus" />}
                    onClick={handleAddQuestion}
                >
                    Add Question
                </Button>
            </Box>

            <Card className="p-4">
                <Typography variant="h6" className="mb-4">Survey Questions</Typography>
                <Box className="space-y-4">
                    {questions.map((question) => (
                        <Card
                            key={question.id!}
                            className="p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleEditQuestion(question as SurveyQuestionsRecord)}
                        >
                            <Box className="flex justify-between items-start">
                                <Box>
                                    <Typography variant="subtitle1">{question.Question}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Type: {question.Type}
                                    </Typography>
                                    {question.Choices && (
                                        <Typography variant="body2" color="textSecondary">
                                            Choices: {question.Choices}
                                        </Typography>
                                    )}
                                </Box>
                                <Button
                                    size="small"
                                    startIcon={<Iconify icon="mdi:pencil" />}
                                >
                                    Edit
                                </Button>
                            </Box>
                        </Card>
                    ))}
                </Box>
            </Card>

            <SurveyQuestionModal
                open={isQuestionModalOpen}
                onClose={() => setIsQuestionModalOpen(false)}
                question={selectedQuestion}
            />
        </Box>
    );
});

export default SurveyConfigPageView; 