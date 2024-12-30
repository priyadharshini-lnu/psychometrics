import * as t from 'io-ts'

export default interface Campaign {
  id: number
  projectId: number
  name: string
  type: string
  status: string
  startDate: Date
  endDate: Date
  assessments: Entity[]
  reports: Entity[]
  isFixedTime: boolean
  permissions: {
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
    viewCampiagnScoring: boolean
    stats: boolean
    pdfPassword: boolean
    viewCampaignScoring: boolean
    manageCampaignScoring: boolean
    viewCampaignScoringSetting: boolean
    viewDataExports: boolean
  }
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
  showWatermark: boolean
  watermarkContent?: string
  fixedTimeDuration?: number
  instructionsEnabled: boolean
  instructionsWithLocales: InstructionsWithLocale[]
  proctoringEnabled: boolean
  rules: object
  identification: string
  proctoringType: string
  availableInstructionLocales: string[]
  descriptionsWithLocales: DescriptionWithLocale[]
  availableDescriptionLocales: string[]
  integrationType: 'iframe' | 'ldb'
  trial: boolean
}
