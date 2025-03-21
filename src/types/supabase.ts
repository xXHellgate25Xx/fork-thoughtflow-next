export interface OpportunitiesRecord {
  id: string;
  name: string;
  stage_id: string;
  close_probability: number;
  estimated_close_date: string | null;
  created_at: string;
  updated_at: string;
  company_id: string;
  owner_id: string;
  amount: number | null;
  [key: string]: any; // For any additional fields
}

export interface Pipeline_StagesRecord {
  id: string;
  name: string;
  order: number;
  pipeline_id: string;
  created_at: string;
  updated_at: string;
  [key: string]: any; // For any additional fields
}

export interface ActivityLogRecord {
  id: string;
  opportunity_id: string;
  activity_type: string;
  notes: string;
  created_at: string;
  updated_at?: string;
  [key: string]: any; // For any additional fields
}
