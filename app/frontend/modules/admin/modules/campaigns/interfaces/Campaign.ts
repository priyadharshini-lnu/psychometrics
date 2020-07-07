export default interface Campaign {
  id: number
  name: string
  type: string
  assessments: Entity[]
  reports: Entity[]
  options: Options
}

export interface Entity {
  name: string
  iconColor: string
  iconUrl: string
}

export interface Options {
  enableAssessmentsInSequentialOrder?: boolean
}
