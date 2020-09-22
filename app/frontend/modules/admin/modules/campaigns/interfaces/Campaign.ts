export default interface Campaign {
  id: number
  name: string
  type: string
  startDate: Date,
  endDate: Date,
  assessments: Entity[]
  reports: Entity[]
  options: CampaignOptions
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
  instructions?: string
}
