import Norm from './Norm'

export default interface UserAssessment {
  id: number
  name: string
  category: string
  assessmentId: number
  isExpired: boolean
  isExternal: boolean
  additionalTime: number | null
  normId: number
  normName: string
  status: string
  norms?: Norm[]
  mettlScheduleRecordId?: string,
  reportIds: number[]
  permissions: {
    updateAdditionalTime: boolean
    resetResults: boolean
    updateNorm: boolean
    remove: boolean
    rescoreResponse: boolean
    resetProgress: boolean
    pushWebhook: boolean
    updateMettlSchedule: boolean
  }
}
