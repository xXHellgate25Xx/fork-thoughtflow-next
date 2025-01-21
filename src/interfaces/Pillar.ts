export interface FetchedPillar {
    id: string;
    created_at: string;
    updated_at: string;
    name: string;
    is_active: boolean;
}

export interface PillarFormat {
    id: string;
    created_at: string;
    updated_at: string;
    name: string;
    is_active: boolean;
    metrics?: {
        views: number;
    }
}
