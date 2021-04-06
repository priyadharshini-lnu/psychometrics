import Norm from './Norm'

export default interface Assessment {
  id: number
  name: string
  reportIds: number[]
  category: string
  assessmentId: number
  assessorFormId: number
  assessorFormName: string
  normId: number
  normName: string
  enableUniversalLinks: boolean
  isExternal: boolean
  universalLink: string | null
  norms?: Norm[]
  permissions: {
    importRawData: boolean
    exportRawResults: boolean
    exportScoringResults: boolean
    exportNormedResults: boolean
    exportRawFactorScores: boolean
    exportExternalResults: boolean
  }
}
