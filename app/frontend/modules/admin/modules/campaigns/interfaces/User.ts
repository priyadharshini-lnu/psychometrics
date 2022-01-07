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
    manageAdmins: boolean
    manageProjectSmtpSettings: boolean
    manageCampaignAdmins: boolean
    manageCampaigns: boolean
    viewRegistrationCodes: boolean
    viewSmsInvites: boolean
    viewDatasheets: boolean
  }
}
