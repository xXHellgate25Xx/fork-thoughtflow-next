export interface IdeaFormat {
    idea_id: string;
    created_at: string;
    updated_at: string;
    text: string;
    number_of_posts: number | undefined;
    voice_input: string | null;
    user_id: string;
    pillar_id: string | null;
    is_deleted: boolean;
}

