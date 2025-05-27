import { useEffect, useState } from "react";
import type {
    ContactsRecord,
    OpportunitiesRecord,
    PipelineStageActivitiesRecord,
    PipelineStagesRecord,
    TeamMembersRecord,
} from "src/types/mapAirtableTypes";
import { useContacts, useOpportunities, usePipelineStageActivities, usePipelineStages, useTeamMembers } from "./tablehooks";

interface AccountMasterData {
    contacts: Partial<ContactsRecord>[];
    opportunities: Partial<OpportunitiesRecord>[];
    owners: Partial<TeamMembersRecord>[];
    stages: Partial<PipelineStagesRecord>[];
    stageActivityLogs: Partial<PipelineStageActivitiesRecord>[];
    isLoading: boolean;
    isError: boolean;
}

export const useAccountMasterData = (): AccountMasterData => {
    const [data, setData] = useState<
        Omit<AccountMasterData, "isLoading" | "isError">
    >({
        contacts: [],
        opportunities: [],
        owners: [],
        stages: [],
        stageActivityLogs: [],
    });

    const contactsQuery = useContacts({ limit: 100 });
    const opportunitiesQuery = useOpportunities({ limit: 100 });
    const ownersQuery = useTeamMembers({ limit: 100 });
    const stagesQuery = usePipelineStages({ limit: 100 });
    const stageActivityLogsQuery = usePipelineStageActivities({ limit: 100 });

    const isLoading = opportunitiesQuery.isLoading || contactsQuery.isLoading;
    const isError = opportunitiesQuery.isError || contactsQuery.isError;

    useEffect(() => {
        if (
            !isLoading &&
            !isError &&
            contactsQuery.records &&
            opportunitiesQuery.records
        ) {
            setData({
                contacts: contactsQuery.records,
                opportunities: opportunitiesQuery.records,
                owners: ownersQuery.records,
                stages: stagesQuery.records,
                stageActivityLogs: stageActivityLogsQuery.records,
            });
        }
    }, [
        isLoading,
        isError,
        contactsQuery.records,
        opportunitiesQuery.records,
    ]);

    return {
        ...data,
        isLoading,
        isError,
    };
};
