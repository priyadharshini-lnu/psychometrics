export enum DrawerMode {
  View = 'view',
  Edit = 'edit',
  Add = 'add',
}

export const DRAWER_SEARCH_PARAMS = {
  MODE: 'mode',
  ADMIN_ID: 'adminId',
}

export enum GrantType {
  view = 'view',
  manage = 'manage',
  manage_users = 'manage_users',
  manage_options = 'manage_options',
  view_report = 'view_report',
  download_report = 'download_report',
  report_data = 'report_data',
  raw_responses = 'raw_responses',
  scores = 'scores',
  reset_responses = 'reset_responses',
  rescrore_responses = 'rescore_responses',
  manage_report_approvals = 'manage_report_approvals'
}

export enum ParentResourceType {
  Project = 'projects',
  Campaign = 'new_campaigns',
}
