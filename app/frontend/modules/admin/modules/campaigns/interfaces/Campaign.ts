export default interface Campaign {
  id: number
  name: string
  type: string
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
  fixedTime: boolean
  fixedTimeDuration?: number
}
