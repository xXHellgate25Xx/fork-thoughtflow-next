import { SurveyQuestionsRecord } from "src/types/mapAirtableTypes";

export interface ParsedSurveyResponse {
  qid: string;
  question: string;
  answer: string;
}

/**
 * Parses a survey response string into an array of objects with qid, question, and answer.
 * @param response The raw survey response string
 * @returns Array of parsed responses
 */
export function parseSurveyResponse(response: string): ParsedSurveyResponse[] {
  try {
    if (!response) return [];
    return response
      .split('--------')
      .filter(block => !["", "N/A", undefined].includes(block))
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      const qidMatch = block.match(/QID:\s*(.*)/);
      const questionMatch = block.match(/Q:\s*(.*)/);
      const answerMatch = block.match(/A:\s*([\s\S]*)/);
      return {
        qid: qidMatch ? qidMatch[1].trim() : '',
        question: questionMatch ? questionMatch[1].trim() : '',
          answer: answerMatch ? answerMatch[1].trim() : '',
        };
      });
  } catch (error) {
    console.error('Error parsing survey response:', error);
    return [];
  }
}
export function formatSurveyResponses(
  questions: Partial<SurveyQuestionsRecord>[],
  responses: Record<string, string>
): string {
  return questions
    .filter(q => q.id)
    .map(q => {
      const qid = q.id || '';
      const questionText = q.Question || '';
      const response = responses[qid] || 'N/A';
      return `QID: ${qid}\nQ: ${questionText}\nA: ${response}`;
    })
    .join('\n--------\n');
} 