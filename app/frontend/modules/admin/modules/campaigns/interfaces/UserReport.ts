export default interface UserReport {
  id: number
  name: string
  reportId: number
  userAccess: boolean
  reportFamilyName: string
  permissions: {
    downloadReport: boolean
    remove: boolean
    viewReport: boolean
    toggleAccess: boolean
  }
}
