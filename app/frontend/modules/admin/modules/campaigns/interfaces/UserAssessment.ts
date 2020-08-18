import Norm from './Norm'

export default interface UserAssessment {
  id: number
  name: string
  category: string
  assessmentId: number
  normId: number
  normName: string
  normType: string
  status: string
  norms?: Norm[]
}
