import { FC, useMemo, useState } from 'react';
import { formatNumber } from 'src/libs/utils/NumberUtil';
import { formatDateISO } from 'src/libs/utils/TimeUtil';
import type { SurveyQuestionsRecord } from 'src/types/mapAirtableTypes';

interface SurveySectionProps {
    newStage: string;
    stageLabels: Record<string, string>;
    isLoadingQuestions: boolean;
    questionsError: Error | null;
    surveyState: {
        questions: Partial<SurveyQuestionsRecord>[];
        hasAnySurvey: boolean;
        surveyId: string | undefined;
        responses: Record<string, string>;
    };
    errors: Record<string, string>;
    onSurveyResponse: (questionId: string | undefined, label: string, value: string) => void;
    isApplyingChanges: boolean;
}

const SurveySection: FC<SurveySectionProps> = ({
    newStage,
    stageLabels,
    isLoadingQuestions,
    questionsError,
    surveyState,
    errors,
    onSurveyResponse,
    isApplyingChanges
}) => {
    const [isAccordionOpen, setIsAccordionOpen] = useState(true);

    // Calculate completion stats
    const completionStats = useMemo(() => {
        const totalQuestions = surveyState.questions.filter(q => q.id).length;
        const answeredQuestions = surveyState.questions.filter(q =>
            q.id && surveyState.responses[q.id] !== undefined &&
            surveyState.responses[q.id] !== ''
        ).length;
        return {
            total: totalQuestions,
            answered: answeredQuestions,
            isComplete: totalQuestions > 0 && answeredQuestions === totalQuestions
        };
    }, [surveyState.questions, surveyState.responses]);

    // Get button styles based on completion state
    const getButtonStyles = () => {
        if (isLoadingQuestions || isApplyingChanges) return "bg-gray-50";
        if (completionStats.isComplete) return "bg-green-50 hover:bg-green-100";
        return "bg-gray-50 hover:bg-gray-100 rounded-b-md";
    };

    // Get text color based on completion state
    const getTextStyles = () => {
        if (isLoadingQuestions || isApplyingChanges) return "text-gray-700";
        if (completionStats.isComplete) return "text-green-700";
        return "text-gray-900";
    };

    // Get progress text
    const getProgressText = () => {
        if (completionStats.isComplete) {
            return <span className="ml-2 text-sm font-normal text-green-600">(Complete)</span>;
        }
        return (
            <span className="ml-2 text-sm font-normal text-gray-500">
                ({completionStats.answered}/{completionStats.total} answered)
            </span>
        );
    };

    const renderSurveyInput = (question: Partial<SurveyQuestionsRecord>) => {
        if (!question.id || !question.Type) return null;
        switch (question.Type) {
            case 'Multiple choice': {
                const options = question.Choices?.split('\n') || [];
                return (
                    <div className="space-y-2">
                        {options.map((choice: string) => {
                            const choiceId = `survey_${question.id}_${choice.trim()}`;
                            const response = question.id ? surveyState.responses[question.id]?.trim() : undefined;
                            return (
                                <label
                                    key={choice}
                                    htmlFor={choiceId}
                                    className="flex items-center space-x-3 cursor-pointer"
                                >
                                    <input
                                        id={choiceId}
                                        type="radio"
                                        name={`survey_${question.id}`}
                                        value={choice.trim()}
                                        checked={response === choice.trim()}
                                        onChange={(e) => onSurveyResponse(question.id, question.Question ?? '', e.target.value)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{choice.trim()}</span>
                                </label>
                            );
                        })}
                    </div>
                );
            }
            case 'Yes/No':
                return (
                    <div className="space-y-2">
                        {['Yes', 'No'].map((choice) => {
                            const choiceId = `survey_${question.id}_${choice}`;
                            const response = question.id ? surveyState.responses[question.id]?.trim() : undefined;
                            return (
                                <label
                                    key={choice}
                                    htmlFor={choiceId}
                                    className="flex items-center space-x-3 cursor-pointer"
                                >
                                    <input
                                        id={choiceId}
                                        type="radio"
                                        name={`survey_${question.id}`}
                                        value={choice}
                                        checked={response === choice}
                                        onChange={(e) => onSurveyResponse(question.id, question.Question ?? '', e.target.value)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{choice}</span>
                                </label>
                            );
                        })}
                    </div>
                );
            case 'Number': {
                const inputValue = question.id ? surveyState.responses[question.id]?.replace(/,/g, '') || '' : '';
                return (
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9,]*"
                        value={formatNumber(inputValue)}
                        onChange={(e) => {
                            // Remove non-numeric except comma
                            const raw = e.target.value.replace(/[^0-9,]/g, '');
                            const formatted = formatNumber(raw);
                            onSurveyResponse(question.id, question.Question ?? '', formatted);
                        }}
                        placeholder="Enter a number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                );
            }
            case 'Currency': {
                const inputValue = question.id ? surveyState.responses[question.id]?.replace(/[^0-9.]/g, '') || '' : '';
                return (
                    <div className="relative flex items-center">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9,.]*"
                            value={inputValue ? formatNumber(inputValue) : ''}
                            onChange={(e) => {
                                // Remove non-numeric except dot and comma
                                const raw = e.target.value.replace(/[^0-9.]/g, '');
                                const formatted = `$${formatNumber(raw)}`;
                                onSurveyResponse(question.id, question.Question ?? '', formatted);
                            }}
                            placeholder="Enter amount"
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>
                );
            }
            case 'Date': {
                const inputValue = question.id ? surveyState.responses[question.id] || '' : '';
                return (
                    <input
                        type="date"
                        value={inputValue ? formatDateISO(inputValue) : ''}
                        onChange={(e) => {
                            onSurveyResponse(question.id, question.Question ?? '', formatDateISO(e.target.value));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                );
            }
            case 'Rating': {
                const rating = question.id ? (surveyState.responses[question.id]?.match(/⭐/g)?.length || 0) : 0;
                return (
                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => {
                                    const saveValue = '⭐'.repeat(star);
                                    onSurveyResponse(question.id, question.Question ?? '', saveValue);
                                }}
                                className="focus:outline-none"
                                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                            >
                                <svg
                                    className={`w-6 h-6 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                                </svg>
                            </button>
                        ))}
                    </div>
                );
            }
            default:
                return (
                    <input
                        type="text"
                        defaultValue={question.id ? surveyState.responses[question.id]?.trim() || '' : ''}
                        onBlur={(e) => {
                            if (e.target.value.trim()) {
                                onSurveyResponse(question.id, question.Question ?? '', e.target.value);
                            }
                        }}
                        placeholder="Enter your answer"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                );
        }
    };

    const renderQuestion = (question: Partial<SurveyQuestionsRecord>) => {
        if (!question.id) return null;

        return (
            <div key={question.id} className="space-y-2">
                <label htmlFor={`survey_${question.id}`} className="block text-sm font-medium">
                    {question.Question}
                </label>
                <div className="mt-1">
                    {renderSurveyInput(question)}
                </div>
            </div>
        );
    };

    return (
        <>
            {(!newStage || isLoadingQuestions || !surveyState.hasAnySurvey) && (
                <div className="flex items-center gap-2">
                    <span className="px-2 pb-3 text-sm text-blue-600">
                        {!newStage
                            ? "You will see surveys after choosing a stage"
                            : isLoadingQuestions
                                ? "Loading surveys"
                                : !surveyState.hasAnySurvey && "No surveys available for this stage"
                        }
                    </span>
                    {isLoadingQuestions && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                    )}
                </div>
            )}

            {questionsError && (
                <div className="text-red-500 text-sm">
                    Failed to load survey questions. Please try again.
                </div>
            )}

            {newStage && surveyState.hasAnySurvey && (
                <div className="bg-gray-50 rounded-md border border-gray-200">
                    <button
                        type="button"
                        className={`w-full px-4 py-3 rounded-t-md text-left flex justify-between items-center transition-colors duration-200 ${getButtonStyles()}`}
                        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                    >
                        <div className="flex items-center gap-2">
                            <span className={`text-base font-medium ${getTextStyles()}`}>
                                Survey Questions for {stageLabels[newStage]}
                                {getProgressText()}
                            </span>
                            {(isLoadingQuestions || isApplyingChanges) && (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                            )}
                        </div>
                        <svg
                            className={`h-5 w-5 transform transition-transform duration-200 ${isAccordionOpen ? 'rotate-180' : ''} ${completionStats.isComplete ? 'text-green-600' : 'text-gray-500'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isAccordionOpen && (
                        <div className="p-4 px-6 rounded-b-md bg-white border-t border-gray-200">
                            <div className="flex flex-col md:flex-row gap-10">
                                {/* Left Column */}
                                <div className="flex-1 space-y-4">
                                    {surveyState.questions.slice(0, Math.ceil(surveyState.questions.length / 2)).map(renderQuestion)}
                                </div>
                                {/* Right Column */}
                                <div className="flex-1 space-y-4">
                                    {surveyState.questions.slice(Math.ceil(surveyState.questions.length / 2)).map(renderQuestion)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default SurveySection; 