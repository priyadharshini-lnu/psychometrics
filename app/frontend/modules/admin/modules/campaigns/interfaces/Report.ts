export default interface Report {
  id: number
  name: string
  category: string
  reportId: number
  userAccess: boolean
  assessorAccess: boolean
  userDashboard: boolean
  reportFamilyName: string
  autoAssign: boolean
  effectiveDefaultLanguage?: string
  availableLanguages?: string[]
  internal: boolean
  customUpload: boolean
  tenantId?: number | null
}
