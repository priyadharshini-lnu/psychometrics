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
}

export interface Entity {
  name: string
  iconColor: string
  iconUrl: string
}

export interface CampaignOptions {
  timeZone?: string
  fixedTime: boolean
  fixedTimeDuration?: number
  instructionsEnabled: boolean
  instructions?: string
}
