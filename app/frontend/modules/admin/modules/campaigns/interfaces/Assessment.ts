import Norm from './Norm'

export default interface Assessment {
  id: number
  name: string
  reportIds: number[]
  category: string
  assessmentId: number
  normId: number
  normName: string
  enableUniversalLinks: boolean
  isAgile: boolean
  isExternal: boolean
  universalLink: string | null
  norms?: Norm[]
}
