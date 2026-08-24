import * as t from 'io-ts'


export interface CommonCampaignPermissions {
  edit: boolean
  delete: boolean
  copy: boolean
  updateCampaignOptions: boolean
  manageCampaigns: boolean
  viewRegistrationCodes: boolean
  viewDatasheets: boolean
  manageCampaignAdmins: boolean
  manageOptions: boolean
  viewDashboard: boolean
  initializeDashboard: boolean
  viewAccesssheet: boolean
  viewAccesssheetSettings: boolean
  viewSmsInvites: boolean
  viewAssessors: boolean
  viewWorkshops: boolean
  viewWorkshopInvites: boolean
  stats: boolean
  pdfPassword: boolean
  viewCampaignScoring: boolean
  manageCampaignScoring: boolean
  viewCampaignScoringSetting: boolean
  viewAuditReports: boolean
  viewAssessmentsAndReports: boolean
  manageReportApprovalSettings: boolean
  convertToTemplate: boolean
  exportDashboardToFile: boolean
  viewAiArtifacts: boolean
  viewCampaign: boolean
  manageIdpPlans: boolean
  manageAiScoringApprovalSettings: boolean
  viewCommunicationCenter: boolean
}

export default interface Campaign {
  id: number
  projectId: number
  tenantId?: number
  name: string
  type: string
  status: string
  startDate?: Date | null | string
  endDate?: Date | null | string
  assessments: Entity[]
  reports: Entity[]
  isFixedTime?: boolean | null
  isThreesixty?: boolean | null
  permissions: CommonCampaignPermissions
  practiceCampaign?: boolean | null
  isTemplate?: boolean
  tagList?: string[]
}

export interface Entity {
  name: string
  iconColor: string
  iconUrl: string
}
export interface InstructionsWithLocale {
  instructions: string
  locale: string
}

export const DescriptionWithLocaleTR = t.type({ description: t.union([t.string, t.null]), locale: t.string })
export type DescriptionWithLocale = t.TypeOf<typeof DescriptionWithLocaleTR>
export interface CampaignOptions {
  timeZone?: string
  fixedTime: boolean
  workshopBookingRequiresPreworkCompletion: boolean
  workshopInviteRequiresPreworkCompletion: boolean
  showWatermark: boolean
  watermarkContent?: string
  fixedTimeDuration?: number
  instructionsEnabled: boolean
  instructionsWithLocales: InstructionsWithLocale[]
  proctoringEnabled: boolean
  selectiveProctoringEnabled?: boolean
  proctoringEnabledOnWorkshopActivity: boolean
  enableMobileProctoring: boolean
  rules: object
  systemCheckEnabled: boolean
  skipAssessmentLevelChecks: boolean
  systemCheckValidity: number | null
  identification: string
  proctoringType: string
  availableInstructionLocales: string[]
  descriptionsWithLocales: DescriptionWithLocale[]
  availableDescriptionLocales: string[]
  integrationType: 'iframe' | 'ldb'
  trial: boolean
  enableVideoCallRecording?: boolean;
  allowVideoCallRecording?: boolean;
  hideParticipantVideo?: boolean;
  disableTranscriptDownload?: boolean;
  minimumUploadSpeed?: number;
  minimumDownloadSpeed?: number;
  calculatedMinimumUploadSpeed: number;
  calculatedMinimumDownloadSpeed: number;
  allowContinueWithWarning: boolean;
  faceDetectionEnabled: boolean
  minimumFaceDetectionRatio: number
  phraseVerificationEnabled: boolean
}
