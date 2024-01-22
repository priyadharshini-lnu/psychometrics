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
  ClientAdmin = 'client_admin',
}

export enum CampaignTypes {
  common = 'common',
  threesixty = 'threesixty'
}

export const ThreeSixtySpecificGrants = {
  campaigns: ['participant_options', 'reset_nominations', 'report_options'],
  messages: ['email', 'instructions', 'options'],
}

export const ThreeSixtyCampaignAdminGrants = {
  campaigns: [
    'view',
    'manage',
    'manage_users',
    'participant_options',
    'reset_nominations',
    'report_options',
  ],
  datasheets: ['view', 'manage'],
  messages: ['email', 'instructions', 'options'],
  results: [
    'view_report',
    'download_report',
    'raw_responses',
    'reset_responses',
    'rescore_responses',
    'regenerate_report',
    'bulk_regenerate_reports',
  ],
}

export const ClientAdminGrants = {
  clients: ['view', 'view_licenses'],
  projects: ['view', 'manage', 'manage_admins', 'manage_users'],
  users: ['reset_password'],
  projectSettings: [
    'design',
    'smtp',
    'saml',
    'integrations',
    'security',
    'webhooks',
  ],
  dashboards: ['view', 'accesssheet_view', 'accesssheet_manage', 'accesssheet_settings'],
  smsInvites: ['view', 'manage'],
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
    'view_stats',
  ],
  campaignFactors: ['view', 'manage'],
  messages: ['email', 'instructions', 'options'],
  norms: ['view', 'manage'],
  dimensions: ['view', 'manage'],
  assessments: ['view', 'manage'],
  questions: ['view', 'manage'],
  mediaLibraries: ['view', 'manage'],
  communications: ['view', 'manage'],
  reports: ['view', 'manage'],
  results: [
    'view_report',
    'download_report',
    'report_data',
    'raw_responses',
    'scores',
    'reset_responses',
    'approve_report',
    'rescore_responses',
    'reset_progress',
    'regenerate_report',
    'bulk_regenerate_reports',
    'finalize_scores',
  ],
  assessors: ['view', 'manage'],
  registrationCodes: ['view', 'manage'],
  datasheets: ['view', 'manage'],
  auditLogs: ['view'],
  workshops: ['view', 'manage'],
}

export const ProjectAdminGrants = {
  clients: ['view'],
  projects: ['view', 'manage_users'],
  users: ['reset_password'],
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
  campaignFactors: ['view', 'manage'],
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
    'finalize_scores',
  ],
  registrationCodes: ['view', 'manage'],
  communications: ['view', 'manage'],
  assessors: ['view', 'manage'],
  reports: ['manage'],
  datasheets: ['view', 'manage'],
  workshops: ['view', 'manage'],
}

export const CampaignAdminGrants = {
  users: ['reset_password'],
  assessors: ['view', 'manage'],
  campaigns: [
    'view',
    'manage',
    'manage_users',
    'manage_options',
    'manage_report_approvals',
  ],
  campaignFactors: ['view', 'manage'],
  dashboards: ['view', 'accesssheet_view', 'accesssheet_manage', 'accesssheet_settings'],
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
    'finalize_scores',
  ],
  workshops: ['view', 'manage'],
}
