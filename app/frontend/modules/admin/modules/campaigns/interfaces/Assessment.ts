import Norm from './Norm'
import SimulationContentVariation from './SimulationContentVariation'

interface ExternalConfig {
  duration: number
  passPercentage: number
  contentVariationId: string | null
}

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
  mettlScheduleName?: string,
  enableUniversalLinks: boolean
  isExternal: boolean
  universalLink: string | null
  norms?: Norm[]
  simulationContentVariations?: SimulationContentVariation[]
  iconUrl: string | null
  iconColor: string | null
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
    updateContentVariation: boolean
    updateAvailableLocales: boolean
  },
  externalConfig: ExternalConfig,
  campaignAssessmentId: number
  scheduleTime: string
  autoAssign: boolean
  dimensionId: string
}
