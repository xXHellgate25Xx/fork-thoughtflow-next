import React, { useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross1Icon } from '@radix-ui/react-icons';

import StageTransitionForm from './StageTransitionForm';

import type { Activity_LogRecord, OpportunitiesRecord, Pipeline_StagesRecord } from '../types/airtableTypes';

interface StageTransitionModalProps {
    open: boolean;
    onClose: () => void;
    opportunity: OpportunitiesRecord;
    pipelineStages: Partial<Pipeline_StagesRecord>[];
    onSubmit: (activityLog: Partial<Activity_LogRecord>) => Promise<void>;
    isSubmitting: boolean;
}

const StageTransitionModal: React.FC<StageTransitionModalProps> = React.memo(({
    open,
    onClose,
    opportunity,
    pipelineStages,
    onSubmit,
    isSubmitting
}) => {
    // Filter to ensure all stages have IDs and required fields
    const validStages = useMemo(() => pipelineStages.filter(
        stage => !!stage && !!stage.id && !!stage['Stage ID'] && !!stage['Stage Name']
    ) as Pipeline_StagesRecord[], [pipelineStages]);

    // Create an adapter function to convert the form values to activity log format
    const handleSubmit = (values: {
        stageId: string;
        closeProbability: number;
        estimatedCloseDate: Date | null;
        comments: string;
    }) => {
        // Convert the form values to an activity log format
        const activityLog: Partial<Activity_LogRecord> = {
            'New Stage': [values.stageId],
            'Note': values.comments,
            'Next Contact Date': values.estimatedCloseDate ? values.estimatedCloseDate.toISOString() : undefined,
            'Prospect': [opportunity.id]
        };

        // Call the original onSubmit function
        onSubmit(activityLog);
    };

    return (
        <Dialog.Root open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30" />
                <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg focus:outline-none">
                    <Dialog.Title className="m-0 text-lg font-medium">
                        Update Stage for {opportunity['First Name']} {opportunity['Last Name']}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                        <button
                            type="button"
                            className="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 focus:outline-none"
                            aria-label="Close"
                            onClick={onClose}
                        >
                            <Cross1Icon />
                        </button>
                    </Dialog.Close>
                    <div className="mt-4">
                        <StageTransitionForm
                            opportunity={{
                                id: opportunity.id,
                                name: `${opportunity['First Name']} ${opportunity['Last Name']}`,
                                stage_id: opportunity['Current Stage (linked)']?.[0] || '',
                                close_probability: opportunity['Close Probability'] || 0,
                                estimated_close_date: null,
                                created_at: opportunity.createdTime,
                                updated_at: opportunity.lastModifiedTime,
                                company_id: '',
                                owner_id: '',
                                amount: opportunity['Deal Value'] || 0
                            }}
                            pipelineStages={validStages.map(stage => ({
                                id: stage.id,
                                name: stage['Stage Name'],
                                order: 0,
                                pipeline_id: '',
                                created_at: stage.createdTime,
                                updated_at: stage.lastModifiedTime
                            }))}
                            onSubmit={handleSubmit}
                            onCancel={onClose}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
});

export default StageTransitionModal; 