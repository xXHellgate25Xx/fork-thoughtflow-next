import { useCallback, useState } from 'react';
import type { SurveyQuestionsRecord, SurveysRecord } from 'src/types/mapAirtableTypes';
import { useManualSurveyQuestions, useManualSurveys } from './tablehooks';
import type { ManualTableQueryResult } from './useAirtableTable';

export interface SurveyQuestionsResponse {
  questions: Partial<SurveyQuestionsRecord>[];
  hasAnySurvey: boolean;
  surveyId: string | undefined;
}

/**
 * Hook to fetch survey questions for a specific stage
 * Uses manual table hooks for better control over queries
 * Optimized to directly use survey ID from stage record
 */
export const useFetchStageQuestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  
  const manualSurveys = useManualSurveys() as ManualTableQueryResult<SurveysRecord>;
  const manualQuestions = useManualSurveyQuestions() as ManualTableQueryResult<SurveyQuestionsRecord>;

  const fetchStageQuestions = useCallback(async (stageActivityId: string): Promise<SurveyQuestionsResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First get the stage record to get the survey ID
      const surveys = await manualSurveys.query({
        filters: [{
          field: 'Stage Activity',
          operator: 'contains',
          value: stageActivityId
        }],
        limit: 1 // Optimize by limiting to 1 result since we only need the first one
      });
      
      if (!surveys.length) {
        return { 
          questions: [], 
          hasAnySurvey: false, 
          surveyId: undefined 
        };
      }

      const survey = surveys[0];
      const surveyName = survey.Name;

      // Query questions directly using the survey ID
      const questions = await manualQuestions.query({
        filters: [{
          field: '[CRM] Surveys',
          operator: 'contains',
          value: surveyName
        }]
      });

      return {
        questions: questions || [],
        hasAnySurvey: true,
        surveyId: survey.id
      };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [manualSurveys, manualQuestions]);

  return {
    fetchStageQuestions,
    isLoading,
    error
  };
}; 