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
  offset?: string;
  view?: string;
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

export interface Team_MembersRecord {
  id: string;
  'Full-name': string;
  'Emp ID': number;
  'Gender': string;
  'Start Date': string;
  'Employment Stage': string;
  'Place of birth': string;
  'Position': string;
  'Phone number': any;
  'Permanent address in ID card': string;
  'Current address': string;
  'ID card number': number;
  'Date of issue': string;
  'Place of issue ID card': string;
  'Native province (in ID card)': string;
  'Contact in emergency': string;
  'Bank account - Bank name - Bank address Ex: 0012000000 - Eximbank - Chi nhánh Tân Bình': string;
  'PIT Code': number;
  'Social Insurance number': string;
  'Created': string;
  'Last Modified': string;
  'Timestamp': string;
  'Feedback': string;
  'Feedback 2': string;
  'Test connection from Notion': string;
  'Meetings': any;
  'Feedback Team': any;
  'Feedback Team copy': any;
  'Performance Pulse copy': any;
  'Automation Ideas': any;
  'Nick Name': string;
  'Check-list': string;
  'On- Boarding check-list': string;
  'Talent Search': any;
  'Email (from Talent Search)': any;
  'TE Email (from Talent Search)': any;
  'First Name (from Talent Search)': any;
  'Last Name (from Talent Search)': any;
  'Status': string;
  'Probation Review': any;
  'Labor Contract Start Date': string;
  'Date of birth': string;
  '1st Year Review Date': string;
  'Health Insurance Submitted': boolean;
  'Onboarding Email': any;
  'Personal Email': string;
  'Marital status': string;
  'Graduated from': string;
  'ID Image Front': string;
  'ID Image Back': string;
  'Selfie': string;
  'ID Front': Array<{ url: string; filename: string; size: number; type: string; }>;
  'ID Back': Array<{ url: string; filename: string; size: number; type: string; }>;
  'Selfie Image': Array<{ url: string; filename: string; size: number; type: string; }>;
  'Fun Stuff': any;
  'Company Email': string;
  'Partner Email': string;
  'Team Pulse copy': any;
  '1-1 Tasks': any;
  'ThoughtFlow - Content': string;
  'Created By': string;
  '[CRM] Opportunities': any;
  '[CRM] Activity Log': any;
  '[CRM] Salespersons': string;
  '[CRM] Salespersons 2': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface Talent_SearchRecord {
  id: string;
  'Full Name': string;
  'Position': any;
  'Partner': any;
  'Source': string;
  'Status': string;
  'Phone': string;
  'Email': string;
  'Dave Feedback': string;
  'Resume Screen': string;
  'Phone interview': string;
  'Dave interview': string;
  'Client 1st Interview': string;
  'Client 2nd Interview': string;
  'Client 3rd Interview': string;
  'Offer sent': string;
  'Start date': string;
  'Contract': string;
  'Progress': any;
  'Item ID (auto generated)': string;
  'talent search-updates': any;
  'Recruiter': string;
  'Open Date (from Position)': any;
  'Application date': string;
  'Onboarding Date': string;
  'Closed Date (from Position)': any;
  'Days To Hire (from Position)': any;
  'Team Members': any;
  'Referred By': any;
  'Linkedin': string;
  'CV File': Array<{ url: string; filename: string; size: number; type: string; }>;
  'First Name': string;
  'Last Name': string;
  'TE Email': string;
  'Recruiter Note': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface Talent_Search_updatesRecord {
  id: string;
  'Item ID': number;
  'Content Type': string;
  'Content Type 2': string;
  'User': string;
  'Commenter': any;
  'Created At': string;
  'Update Content': string;
  'Likes Count': number;
  'Asset IDs': number;
  'Post ID': number;
  'Candidate': any;
  'Position (from Parent Post ID)': any;
  'Name (from Parent Post ID)': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface Feedback_PartnerRecord {
  id: string;
  'Feedback ID': number;
  'Created Date': string;
  'Name': string;
  'NPS': number;
  'Rate Effectiveness': number;
  'Improve': string;
  'Positive': string;
  'Company': any;
  'Industry (from Company)': any;
  'Account (from Company)': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface Team_PulseRecord {
  id: string;
  'Feedback ID': number;
  'Created Date': string;
  'Name': string;
  'eNPS': number;
  'Partner': any;
  'Effectiveness': number;
  'Growth': number;
  'Partner Relationship': number;
  'Improve': string;
  'Positive': string;
  'Additional Feedback': string;
  'Industry (from Company)': any;
  'Member record': any;
  'Position (from Member record)': any;
  'Full-name (from Member record)': any;
  'Account (from Company)': any;
  'Team Members': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface Performance_PulseRecord {
  id: string;
  'Feedback ID': number;
  'Created Date': string;
  'Name': string;
  'Quality of Work': number;
  'Technical Skills': number;
  'Communication': number;
  'Problem-Solving': number;
  'Initiative': number;
  'Teamwork': number;
  'Continuous Learning': number;
  'Innovation': number;
  'Attendance': number;
  'Core Values': number;
  'Start Doing': string;
  'Additional Comments': string;
  'Partner': any;
  'Recommendation': string;
  'Industry (from Company)': any;
  'Member record': any;
  'Full-name (from Member record)': any;
  'Account (from Company)': any;
  'Team Members': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface MeetingsRecord {
  id: string;
  'Title': string;
  'Start': string;
  'End': string;
  'Status': string;
  'Feedback': string;
  'Type': any;
  'Summary': string;
  '[Sales] Deals': any;
  '1-1 Tasks': any;
  'Transcript': string;
  'Email': string;
  'Transcript PDF': Array<{ url: string; filename: string; size: number; type: string; }>;
  'Duration': number;
  'Members': string;
  'Clients': string;
  'Topics discussed': string;
  'Record ID': any;
  'Organization': string;
  'Organization Link': any;
  'Account (from Organization Link )': any;
  'Meeting ID': number;
  'Calendar ID': string;
  'Fireflies Transcript ID': string;
  'Created': string;
  'Type Name (from Type)': any;
  'Type ID (from MeetingActions)': any;
  'Description': string;
  'Notion ID (from [Sales] Deals)': any;
  'Commitments': string;
  'Type (Old)': string;
  'Transcript length': any;
  'Last Modified': string;
  'Owner': any;
  'Full-name (from Owner)': any;
  'MeetingactionID': any;
  'Summary Template (from Type)': any;
  'Prompt (from Meeting Actions)': any;
  'Action (from Meeting Actions)': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface Meeting_ActionsRecord {
  id: string;
  'Meeting Type': string;
  'Action': string;
  'Web Hook': string;
  'Prompt': string;
  'Summary Template': string;
  'Type ID': any;
  'MeetingactionID': number;
  'Meetings': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _1_1_TasksRecord {
  id: string;
  'Item': string;
  'Meeting': any;
  'Assignee ID': any;
  'Assignee': any;
  'Onboarding Email (from Assignee)': any;
  'Due date': string;
  'Notion URL': string;
  'Start (from Meeting)': any;
  'Record ID (from Meeting)': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface Welcome_EmailRecord {
  id: string;
  'Emp ID': number;
  'Sent Email': string;
  'Email Content': string;
  'Status': string;
  'Sent Date': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _Sales__ContactsRecord {
  id: string;
  'Name': string;
  'fm': any;
  'Organization': any;
  'Phone': string;
  'Email': string;
  'First Meeting': string;
  'LinkedIn': string;
  'Primary Contact Type': any;
  'Notion Created Time': string;
  'Created': string;
  'Last Modified': string;
  'Priority': string;
  'Notion ID': string;
  '[CRM] Accounts': any;
  '[CRM] Opportunities': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _Sales__DealsRecord {
  id: string;
  'Deal': string;
  'Stage': string;
  'Deal Value': number;
  'Actual Deal Value': number;
  'Close Probability': string;
  'Priority': string;
  'Created Date': string;
  'Created': string;
  'Notes': string;
  'Proposal': string;
  'Rate Card': string;
  'Company': any;
  'Contact (from Company)': any;
  'Phone (from Contact) (from Company)': any;
  'Email (from Contact) (from Company)': any;
  'Last Modified': string;
  'Notion ID': string;
  'Meetings': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface Coaching_SessionRecord {
  id: string;
  'Email': string;
  'Coaching Notes': string;
  'Coach': string;
  'Status': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface PositionRecord {
  id: string;
  'Name': string;
  'Job Description': string;
  'Status': string;
  'Open Date': string;
  'Closed Date': string;
  'Days To Hire': number;
  'talent search': any;
  'Partner': any;
  'Account (from Parnter)': any;
  'Industry (from Parnter)': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface Interview_RatingRecord {
  id: string;
  'Feedback ID': number;
  'Created Date': string;
  'Name': string;
  'Quality of Work': number;
  'Technical Skills': number;
  'Communication': number;
  'Problem-Solving': number;
  'Initiative': number;
  'Teamwork': number;
  'Continuous Learning': number;
  'Innovation': number;
  'Attendance': number;
  'Core Values': number;
  'Start Doing': string;
  'Additional Comments': string;
  'Partner': any;
  'Recommendation': string;
  'Industry (from Company)': any;
  'Member record': any;
  'Full-name (from Member record)': any;
  'Account (from Company)': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface Automation_IdeasRecord {
  id: string;
  'Automation Name': string;
  'Idea': string;
  'AI Generated Concept': string;
  'Email': string;
  'Video': Array<{ url: string; filename: string; size: number; type: string; }>;
  'Images': Array<{ url: string; filename: string; size: number; type: string; }>;
  'First Name': string;
  'Team Member': any;
  'Onboarding Email (from Team Member)': any;
  'Nick Name (from Team Member)': any;
  'Full-name (from Team Member)': any;
  'Position (from Team Member)': any;
  'Status': string;
  'Created Date': string;
  'Calculation': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface General_FeedbackRecord {
  id: string;
  'Feedback ID': number;
  'Created Date': string;
  'Name': string;
  'Meeting Type': string;
  'Effectiveness': number;
  'Growth': number;
  'What Should Improve': string;
  'What Did You Like': string;
  'Additional Feedback': string;
  'Member record': any;
  'Position (from Member record)': any;
  'Full-name (from Member record)': any;
  'Account (from Company)': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface RetroRecord {
  id: string;
  'Name': string;
  'What Went Well': string;
  'What Can I improve': string;
  'Status': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _Sales__Collect_Leads_from_TE_WebsiteRecord {
  id: string;
  'name': string;
  'Note': string;
  'appoiment_date': string;
  'duration_meeting': string;
  'email': string;
  'phone': any;
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
  'ThoughtFlow - Ideas': string;
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

export interface ThoughtFlow___PromptsRecord {
  id: string;
  'Channel': string;
  'Type': string;
  'Prompt': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface OrganizationsRecord {
  id: string;
  'Account': string;
  'Status': string;
  'Priority': string;
  'Industry': string;
  'Website': string;
  'TE Page': string;
  'Notion Created Time': string;
  'Last Modified Time': string;
  '[Sales] Deals': any;
  'Notion ID': string;
  'Contact': any;
  'Phone (from Contact)': any;
  'Email (from Contact)': any;
  'Position': any;
  'Feedback': any;
  'Talent Search': any;
  'Feedback copy': any;
  'Feedback Team copy': any;
  'Performance Pulse copy': any;
  'Team Pulse copy': string;
  'Meetings': string;
  'Meetings 2': any;
  '[CRM] Opportunities': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _CRM__SalespersonsRecord {
  id: string;
  'Email': string;
  'Team Members Record': any;
  'Full Name': any;
  'Role': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _CRM__Sales_PlaybookRecord {
  id: string;
  'Name': string;
  'Description': string;
  '[CRM] Pipeline Stages': any;
  '[CRM] Opportunities': any;
  'Created': string;
  'Last Modified': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _CRM__Pipeline_StagesRecord {
  id: string;
  'Name': string;
  'Phase': string;
  'Notes': string;
  'Playbook': any;
  'Owner': string;
  'Created': string;
  'Last Modified': string;
  '[CRM] Pipeline Stage Activities': any;
  '[CRM] Contacts': string;
  '[CRM] Opportunities': any;
  '[CRM] Activity Log': any;
  '[CRM] Activity Log 2': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _CRM__Pipeline_Stage_ActivitiesRecord {
  id: string;
  'ID': string;
  'Name': string;
  'Stage': any;
  'Created': string;
  'Last Modified': string;
  'Action': string;
  'Owner (from Stage)': any;
  'Automated': boolean;
  'Timing': string;
  'Content Type': string;
  'Content': string;
  'Possible Next Steps': any;
  '[CRM] Surveys': any;
  '[CRM] Activity Log': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _CRM__SurveysRecord {
  id: string;
  'Name': string;
  'Questions': any;
  'Stage Activity': any;
  'Created': string;
  'Last Modified': string;
  '[CRM] Survey Responses': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _CRM__Survey_QuestionsRecord {
  id: string;
  'Question': string;
  'Type': string;
  'Choices': string;
  '[CRM] Surveys': any;
  'Created': string;
  'Last Modified': string;
  'Record ID': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _CRM__ContactsRecord {
  id: string;
  'Name': any;
  'First Name': string;
  'Last Name': string;
  'Created': string;
  'Last Modified': string;
  'Email': string;
  'Phone': any;
  'Job Title': string;
  'Company': any;
  'Website': string;
  'LinkedIn': string;
  'Address': string;
  'City': string;
  'State/Province': string;
  'Country': string;
  'Timezone': string;
  'Notes': string;
  'Preferred Contact Method': string;
  'Lead Source': string;
  'Tag': any;
  'Company Name': any;
  '[CRM] Opportunities': string;
  '[CRM] Survey Responses': any;
  '[CRM] Opportunities 2': any;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _CRM__AccountsRecord {
  id: string;
  'Name': string;
  'Industry': string;
  'Created': string;
  'Last Modified': string;
  'Website': string;
  'Contacts': any;
  'Account Lead Source ': string;
  '[Sales] Contacts': any;
  'Opportunities': any;
  'Priority': string;
  'Research': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _CRM__OpportunitiesRecord {
  id: string;
  'Name': string;
  'Stage': any;
  'Phase (from Stage)': any;
  'Created': string;
  'Last Modified': string;
  'Owner': any;
  'Account': any;
  'Full-name (from Owner)': any;
  'Referred By': any;
  'Contacts': any;
  'Amount': number;
  'Proposal URL': string;
  'Total Contract Value': any;
  'Salesperson Probability': number;
  'Calculated Probability': number;
  'Close Date': string;
  'Deal Type': string;
  'Playbook': any;
  '[CRM] Activity Log': any;
  'Contract': string;
  'Name (from Account)': any;
  'Name (from Contacts)': any;
  'Contract URL': string;
  'Active': boolean;
  'Monthly Payment': number;
  'Deposit': number;
  'One Time Payment': number;
  'Duration in Months': number;
  'Contract Expiration': string;
  'Contract Start Date': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _CRM__Activity_LogRecord {
  id: string;
  'ID': any;
  'Opportunity': any;
  'Current Stage': any;
  'New Stage': any;
  'Assigned To': any;
  'Stage Activity': any;
  'Next Contact Date': string;
  'Close Probability by Salesperson': number;
  'Notes': string;
  'Survey Response': any;
  'Created': string;
  'Last Modified': string;
  createdTime: string;
  lastModifiedTime: string;
}

export interface _CRM__Survey_ResponsesRecord {
  id: string;
  'Name': any;
  'Activity Log': any;
  'Opportunity (from Activity Log)': any;
  'Survey': any;
  'Contact': any;
  'Response': string;
  'Created': string;
  'Last Modified': string;
  createdTime: string;
  lastModifiedTime: string;
}

export type AirtableTableName = 'Team_Members' | 'Talent_Search' | 'Talent_Search_updates' | 'Feedback_Partner' | 'Team_Pulse' | 'Performance_Pulse' | 'Meetings' | 'Meeting_Actions' | '1_1_Tasks' | 'Welcome_Email' | '_Sales__Contacts' | '_Sales__Deals' | 'Coaching_Session' | 'Position' | 'Interview_Rating' | 'Automation_Ideas' | 'General_Feedback' | 'Retro' | '_Sales__Collect_Leads_from_TE_Website' | 'ThoughtFlow___Content' | 'ThoughtFlow___Ideas' | 'ThoughtFlow___Prompts' | 'Organizations' | '_CRM__Salespersons' | '_CRM__Sales_Playbook' | '_CRM__Pipeline_Stages' | '_CRM__Pipeline_Stage_Activities' | '_CRM__Surveys' | '_CRM__Survey_Questions' | '_CRM__Contacts' | '_CRM__Accounts' | '_CRM__Opportunities' | '_CRM__Activity_Log' | '_CRM__Survey_Responses';
