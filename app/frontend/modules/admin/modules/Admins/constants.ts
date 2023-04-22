export enum DrawerMode {
  View = 'view',
  Edit = 'edit',
  Add = 'add',
}

export const DRAWER_SEARCH_PARAMS = {
  MODE: 'mode',
  ADMIN_ID: 'adminId',
}

export enum ParentResourceType {
  Project = 'projects',
  Campaign = 'new_campaigns',
}

export enum AdminTypes {
  ProjectAdmin = 'project_admin',
  CampaignAdmin = 'campaign_admin',
}

export const ThreeSixtyGrants = {
  campaigns: ['participant_options', 'reset_nominations', 'report_options'],
  messages: ['email', 'instructions', 'options'],
}

export const ProjectAdminGrants = {
  clients: ['view'],
  projects: ['view', 'manage_users'],
  projectSettings: [
    'design',
    'smtp',
    'saml',
    'integrations',
    'security',
    'webhooks',
  ],
  campaigns: [
    'view',
    'manage',
    'manage_users',
    'manage_admins',
    'manage_options',
    'manage_messages',
    'participant_options',
    'reset_nominations',
    'report_options',
    'manage_report_approvals',
  ],
  dashboards: ['view', 'accesssheet_view', 'accesssheet_manage', 'accesssheet_settings'],
  messages: ['email', 'instructions', 'options'],
  smsInvites: ['view', 'manage'],
  results: [
    'view_report',
    'download_report',
    'report_data',
    'raw_responses',
    'scores',
    'reset_responses',
    'edit_report',
    'approve_report',
    'rescore_responses',
    'reset_progress',
    'regenerate_report',
    'bulk_regenerate_reports',
  ],
  registrationCodes: ['view', 'manage'],
  communications: ['view', 'manage'],
  assessors: ['view', 'manage'],
  reports: ['manage'],
  datasheets: ['view', 'manage'],
}

export const CampaignAdminGrants = {
  assessors: ['view', 'manage'],
  campaigns: [
    'view',
    'manage',
    'manage_users',
    'manage_options',
    'manage_report_approvals',
  ],
  smsInvites: ['view', 'manage'],
  communications: ['view', 'manage'],
  datasheets: ['view', 'manage'],
  registrationCodes: ['view', 'manage'],
  results: [
    'view_report',
    'download_report',
    'report_data',
    'raw_responses',
    'scores',
    'reset_responses',
    'rescore_responses',
    'regenerate_report',
    'bulk_regenerate_reports',
  ],
}
