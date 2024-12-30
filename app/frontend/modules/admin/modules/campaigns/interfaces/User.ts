export default interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  active: boolean
  role: string
  grants: object
  permissions: {
    edit: boolean
    loginAs: boolean
    resetPassword: boolean
    remove: boolean
    manageOptions: boolean
    manageProjectAdmins: boolean
    manageProjectSmtpSettings: boolean
    manageProjectGeneralSettings: boolean
    manageCampaignAdmins: boolean
    manageCampaigns: boolean
    viewRegistrationCodes: boolean
    viewSmsInvites: boolean
    viewDatasheets: boolean
    stats: boolean
    pushWebhook: boolean
  }
}
