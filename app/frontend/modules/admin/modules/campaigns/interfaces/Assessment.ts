import Norm from './Norm'

export default interface Assessment {
  id: number
  name: string
  campaignReportsIds: number[]
  category: string
  assessmentId: number
  normId: number
  normName: string
  normType: string
  enableUniversalLinks: boolean
  universalLink: string | null
  norms?: Norm[]
}
