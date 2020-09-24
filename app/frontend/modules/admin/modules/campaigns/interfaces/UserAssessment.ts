import Norm from './Norm'

export default interface UserAssessment {
  id: number
  name: string
  category: string
  assessmentId: number
  isExpired: boolean
  additionalTime: number | null
  normId: number
  normName: string
  normType: string
  status: string
  norms?: Norm[]
  reportIds: number[]
}
