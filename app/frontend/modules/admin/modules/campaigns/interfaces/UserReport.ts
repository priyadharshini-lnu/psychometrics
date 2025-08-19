export default interface UserReport {
  id: number
  name: string
  reportId: number
  userAccess: boolean
  reportFamilyName: string
  reportProvider: string
  hoganParticipantId: string | null
  commentsCount: number
  editsCount: number
  customUpload: boolean
  internal: boolean
  availableLanguages: string[]
  effectiveDefaultLanguage: string
  reportIconUrl: string | null
  reportDownloadUrls: Record<string, string>[]
  approvalStatus: 'not_ready' | 'pending_qc' | 'qc_in_progress' | 'qc_completed' | 'change_requested' | 'approved'
  permissions: {
    downloadReport: boolean
    remove: boolean
    viewReport: boolean
    toggleAccess: boolean
    pushWebhook: boolean
    uploadFile: boolean
    removeFile: boolean
  }
}
