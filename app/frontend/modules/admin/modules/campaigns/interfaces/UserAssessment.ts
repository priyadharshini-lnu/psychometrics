import Norm from './Norm'

export default interface UserAssessment {
  id: number
  name: string
  category: string
  assessmentId: number
  normName: string
  status: string
  norms?: Norm[]
}
