import Norm from './Norm'

export default interface Assessment {
  id: number
  name: string
  category: string
  assessmentId: number
  normName: string
  normType: string
  enableUniversalLinks: boolean
  universalLink: string | null
  norms?: Norm[]
}
