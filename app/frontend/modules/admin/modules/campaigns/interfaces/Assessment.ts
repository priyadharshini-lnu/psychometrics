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
  mettlScheduleRecordId?: string,
  enableUniversalLinks: boolean
  isExternal: boolean
  universalLink: string | null
  norms?: Norm[]
  permissions: {
    exportRawResults: boolean
    exportScoringResults: boolean
    exportNormedResults: boolean
    exportRawFactorScores: boolean
    exportExternalResults: boolean
    importResults: boolean
    remove: boolean
    rescoreResponses: boolean
    updateExternalConfig: boolean
    scheduleAssessment: boolean
    toggleAutoAssign: boolean
    updateMettlSchedule: boolean
  },
  externalConfig: object,
  campaignAssessmentId: number
  scheduleTime: string
  autoAssign: boolean
}
