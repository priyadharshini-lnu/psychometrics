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

export interface CampaignOptions {
  timeZone?: string
  fixedTime: boolean
  fixedTimeDuration?: number
  instructionsEnabled: boolean
  instructionsWithLocales: InstructionsWithLocale[]
  proctoringEnabled: boolean
  rules: object
  identification: string
  availableLocales: string[]
}
