export interface ContentFormat {
    id: string;
    content_id: string;
    title: string;
    description: string;
    content_body: string;
    content_type: string;
    channel?: {
        id: string;
        name: string;
        url?: string;
    };
    published_url?: string | null;
    status: 'draft' | 'published';
    created_at: string;
    updated_at: string;
    idea?: {
        id?: string;
        name?: string;
    }
    pillar?: {
        id?: string;
        name?: string;
    };
    metrics?: {
      views: number;
    //   clicks: number;
    //   conversions: number;
    };
    // tags: string[];
    feedback?: string;
}