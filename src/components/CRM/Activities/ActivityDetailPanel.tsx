import { memo, useMemo } from 'react';
import { useSurveyResponseById } from 'src/hooks/tablehooks';
import { getFormattedDate } from 'src/libs/utils/TimeUtil';
import { parseSurveyResponse } from 'src/libs/utils/surveyResponseUtil';
import type { ActivityLogRecord } from 'src/types/mapAirtableTypes';
import type { FieldDef } from '../Modals/types';

interface ActivityDetailPanelProps {
    selectedActivity: ActivityLogRecord | null;
    activityDisplayFields: FieldDef<any>[];
    renderActivityFieldValue?: (field: FieldDef<any>, value: any) => React.ReactNode;
    className?: string;
}

const defaultRenderActivityFieldValue = (field: FieldDef<any>, value: any) => {
    if (value === null || value === undefined) return '-';
    const actualValue = Array.isArray(value) ? value[0] : value;
    switch (field.type) {
        case 'date':
            try {
                return getFormattedDate(new Date(actualValue));
            } catch (e) {
                return String(actualValue);
            }
        case 'select':
            return field.options?.[actualValue] || String(actualValue);
        case 'search':
            return String(actualValue);
        case 'text':
            if (field.name === 'Notes') {
                return <pre className="whitespace-pre-wrap text-sm">{String(actualValue)}</pre>;
            }
            return String(actualValue);
        default:
            return String(actualValue);
    }
};

const ActivityDetailPanel = memo(({ selectedActivity, activityDisplayFields, renderActivityFieldValue = defaultRenderActivityFieldValue, className = '' }: ActivityDetailPanelProps) => {
    const surveyResponseId = selectedActivity?.['Survey Response']?.[0];
    const { record: surveyResponse, isLoading: isSurveyLoading } = useSurveyResponseById(surveyResponseId || '');
    const surveyResponses = useMemo(() => parseSurveyResponse(surveyResponse?.Response || ''), [surveyResponse]);
    if (!selectedActivity) return <div className="" />;

    return (
        <div className={className}>
            <h2 className="text-lg font-semibold mb-4">Activity Detail</h2>
            <div className=" text-sm space-y-3">
                {activityDisplayFields.map((field) => (
                    <div key={String(field.name)} className="flex flex-col">
                        <span className="font-medium text-gray-700">{field.label}:</span>
                        <span className="text-gray-900">
                            {field.name === 'Survey Response' ? (
                                isSurveyLoading ? (
                                    <span>Loading survey response...</span>
                                ) : surveyResponse ? (
                                    surveyResponse.Response ? (
                                        <div className="border rounded bg-gray-50 p-2 mt-1">
                                            <ul className="list-none p-0 m-0">
                                                {surveyResponses.map(({ qid, question, answer }) => (
                                                    <li key={qid} className="mb-2">
                                                        <div className="grid grid-cols-10 gap-2 items-start">
                                                            <div className="col-span-5 font-semibold text-xs text-gray-600 break-words">{question}</div>
                                                            <div className="col-span-5 text-xs text-gray-900 break-words">{answer || <span className="italic text-gray-400">(No answer)</span>}</div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <span>No response data.</span>
                                    )
                                ) : (
                                    <span>No survey response found.</span>
                                )
                            ) : (
                                renderActivityFieldValue(field, selectedActivity[field.name as keyof ActivityLogRecord])
                            )}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default ActivityDetailPanel; 