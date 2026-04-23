import Norm from './Norm'
import SimulationContentVariation from './SimulationContentVariation'
import PearsonVariation from './PearsonVariation'
import MhsNormRegion from './MhsNormRegion'
import MhsNormOption from './MhsNormOption'

interface ExternalConfig {
  duration: number
  passPercentage: number
  contentVariationId: string | null
  variation: string
  confidenceInterval: number
  leadershipBar: number
  normRegion: number
  normOption: number
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
  pearsonVariations?: PearsonVariation[]
  mhsNormRegions?: MhsNormRegion[]
  mhsNormOptions?: MhsNormOption[]
  iconUrl: string | null
  iconColor: string | null
  permissions: {
    exportRawResults: boolean
    exportScoringResults: boolean
    exportNormedResults: boolean
    exportRawFactorScores: boolean
    exportExternalResults: boolean
    exportOccupations: boolean
    importResults: boolean
    remove: boolean
    rescoreResponses: boolean
    rescoreAiResponses: boolean
    regenerateTranscriptions: boolean
    updateExternalConfig: boolean
    scheduleAssessment: boolean
    toggleAutoAssign: boolean
    updateMettlSchedule: boolean
    normalizeFactorScores: boolean
    updateContentVariation: boolean
    updateAvailableLocales: boolean
    updatePearsonVariation: boolean
    updateMhsConfidenceInterval: boolean;
    updateMhsLeadershipBar: boolean
    updateMhsNormRegion: boolean
    updateMhsNormOption: boolean
    toggleCaching: boolean | undefined;
  },
  externalConfig: ExternalConfig,
  campaignAssessmentId: number
  scheduleTime: string
  autoAssign: boolean
  dimensionId: string
  allowCaching: boolean
  cachingEnabled: boolean
  proctoringEnabled?: boolean
  isTimed: boolean
  fixedTimeDuration?: number
}
