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
