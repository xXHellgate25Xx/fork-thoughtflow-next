// Generated Airtable Types
// This file is auto-generated. Do not edit directly.

// Base interface for filter conditions
export interface FilterCondition {
  field: string;
  operator: 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains' | 'notContains';
  value: any;
  isArray?: boolean;
}

// Base interface for sort conditions
export interface SortCondition {
  field: string;
  direction: 'asc' | 'desc';
}

// Base interface for query options
export interface QueryOptions {
  tableId: string;
  filters?: FilterCondition[];
  sort?: SortCondition[];
  limit?: number;
  offset?: string;  // Airtable uses string-based pagination
  view?: string;    // Airtable view ID
}

// Base interface for Airtable records
export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

// Base interface for table fields
export interface AirtableField {
  id: string;
  name: string;
  type: string;
  options?: { name: string; id: string; }[];
}

// Base interface for table metadata
export interface AirtableTable {
  id: string;
  name: string;
  primaryFieldId: string;
  fields: AirtableField[];
}

export interface EmployeesRecord {
  id: string;
  'Name': string;
  'Position': string;
  'Start Date': string;
  'Employment Stage': string;
  'Labor Contract Start Date': string;
  'Health Insurance Submitted': boolean;
  'Place of birth': string;
  'Phone number': any;
  'Permanent address in ID card': string;
  'Current address': string;
  'ID card number': number;
  'Date of issue': string;
  'Place of issue ID card': string;
  'Native province (in ID card)': string;
  'Contact in emergency': string;
  'Bank account - Bank name - Bank address': string;
  'PIT Code': number;
  'Social Insurance number': string;
  'ID Image Front': string;
  'ID Image Back': string;
  '[Sales] Contacts': string;
  'Pipeline Log': any;
  'Pipeline Log 2': any;
  'Opportunities': any;
  'Opportunities 2': string;
  'Opportunities 3': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface ContactsRecord {
  id: string;
  'Name': string;
  'First Name': string;
  'Last Name': string;
  'Email': string;
  'Phone': any;
  'Job Title': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface Chat_Bot_LeadsRecord {
  id: string;
  'Email': string;
  'Opportunities': any;
  'First Name': string;
  'Last Name': string;
  'Phone': string;
  'Job Title': string;
  'Source Channel': string;
  'FBUserID': number;
  'Campaign': string;
  'Highest Education': string;
  'Networth': string;
  'Family Income': string;
  'EB3 Cost Awareness': string;
  'FB Form Name': string;
  'Audience': any;
  'Created': string;
  'Status': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface OpportunitiesRecord {
  id: string;
  'Prospect ID': any;
  'First Name': string;
  'Last Name': string;
  'Email': string;
  'Job Title': string;
  'Phone': string;
  'Spouse': number;
  '# of Children': number;
  'Additional Dependents': number;
  'Deal Value': number;
  'Close Probability': number;
  'Current Stage': any;
  'FB Excluded': string;
  'Salesperson': any;
  'Retention Expiration Date': string;
  'Communication Consent': string;
  'Consent Granted Date': string;
  'Consent Withdrawn Date': string;
  'Address Ln 1': string;
  'Address Ln 2': string;
  'City': string;
  'Province': string;
  'Country': string;
  'Created Date': string;
  'Last Updated By (linked)': any;
  'General Notes': string;
  'Activity Log': any;
  'Leads': any;
  'Audience (from Leads)': any;
  'FB Form Name (from Leads)': any;
  'Campaign (from Meta Leads)': any;
  'Last Modified': string;
  'Family Income (from Leads)': any;
  'Networth (from Leads)': any;
  'Highest Education (from Leads)': any;
  'Prospect Auto Number': number;
  'Source Channel (from Leads)': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface Activity_LogRecord {
  id: string;
  'ID': number;
  'Prospect': any;
  'Close Probability (from Prospect)': any;
  'First Name (from Prospect)': any;
  'Created': string;
  'Log Date': string;
  'Current Stage': any;
  'New Stage': any;
  'Next Contact Date': string;
  'Contacted By': any;
  'Assigned To': any;
  'Close Probability from Salesperson': number;
  'Explanation': any;
  'Note': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface Pipeline_StagesRecord {
  id: string;
  'Stage ID': string;
  'Stage Name': string;
  'Phase': string;
  'Trigger for Meta': string;
  'Owned By': string;
  'Notes': string;
  'Next Steps': string;
  'Opportunities': any;
  'Opportunities 2': string;
  'Activity Log': any;
  'Activity Log 2': any;
  'Stage Explanation': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface Stage_ExplanationRecord {
  id: string;
  'Explanation': string;
  'Pipeline Stage': string;
  'Pipeline Stage Linked': any;
  'Action': string;
  'Activity Log': any;
  'Stage ID (from Pipeline Stage Linked)': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _Sales__Lead_Information_ChatbotRecord {
  id: string;
  'First Name': string;
  'Last Name': string;
  'Phone': any;
  'Mail': string;
  'User Profile Information': string;
  'User Profile Summary': string;
  'User Type': string;
  'created_date': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface ThoughtFlow___ContentRecord {
  id: string;
  'Title': string;
  'Pillar': string;
  'Idea': any;
  'Content Text': string;
  'Status': string;
  'Channel': string;
  'URL': string;
  'Published At': string;
  'SEO Title': string;
  'Meta Description': string;
  'URL Slug': string;
  'Long Tail Keyword': string;
  'Last Modified': string;
  'Content ID': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface ThoughtFlow___PromptsRecord {
  id: string;
  'Channel': string;
  'Prompt': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface ThoughtFlow___IdeasRecord {
  id: string;
  'Idea': string;
  'Creation Date': string;
  'Content Created': any;
  'Idea ID': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface ArchiveRecord {
  id: string;
  'First Name': string;
  'Last Name': string;
  'Email': string;
  'Phone': string;
  'Job Title': string;
  'Deal Value': number;
  'Close Probability': number;
  'Salesperson': string;
  'Current Stage': string;
  'Spouse': number;
  '# of Children': number;
  'Additional Dependents': number;
  'Audience (from Leads)': string;
  'FB Form Name (from Leads)': string;
  'Campaign (from Meta Leads)': string;
  'Family Income (from Leads)': string;
  'Networth (from Leads)': string;
  'Source Channel (from Leads)': string;
  createdTime: string;
  lastModifiedTime: string;
}

export type AirtableTableName = 'Employees' | 'Contacts' | 'Chat_Bot_Leads' | 'Opportunities' | 'Activity_Log' | 'Pipeline_Stages' | 'Stage_Explanation' | '_Sales__Lead_Information_Chatbot' | 'ThoughtFlow___Content' | 'ThoughtFlow___Prompts' | 'ThoughtFlow___Ideas' | 'Archive';
