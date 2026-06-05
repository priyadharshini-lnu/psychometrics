import Norm from './Norm'

import SimulationContentVariation from './SimulationContentVariation'
import MhsNormRegion from '~/modules/admin/modules/campaigns/interfaces/MhsNormRegion'
import MhsNormOption from '~/modules/admin/modules/campaigns/interfaces/MhsNormOption'

interface SavilleUserAssessmentDetails {
  dataSeprator: string | null
  candidateId: string | null
  requestId: string | null
  normId: string | null
  errorCode: string | null
}

interface SimulationUserAssessmentDetails {
  timeExtension: number | null
  contentVariationId: string | null
  participantId: string | null
}

interface PearsonUserAssessmentDetails {
  normId: string | null
  scheduleId: string | null
  productId: string | null
  assessmentId: string | null
  assessmentLanguage: string | null
  errorDetails: Record<string, unknown> | null
}

interface HoganUserAssessmentDetails {
  formId: string | null
  assessmentId: string | null
}

interface SkillvueUserAssessmentDetails {
  email: string | null
  externalAssessmentId: string | null
  externalUserId: string | null
}

interface YoodliUserAssessmentDetails {
  email: string | null
  externalAssessmentId: string | null
  yoodliActivityId: string | null
}

interface MhsUserAssessmentDetails {
  externalAssessmentId: string | null
  sessionId: string | null
  dataGathererId: string | null
  dataGatheringId: string | null
  confidenceInterval: number | null
  leadershipBar: number | null
  normRegion: number | null
  normOption: number | null
  normRegions: MhsNormRegion[]
  normOptions: MhsNormOption[]
}

interface MicrositeUserAssessmentDetails {
  participantId: string | null
  registrationStatus: string | null
  errorMessage: string | null
  rawResponse: Record<string, unknown> | null
}

export default interface UserAssessment {
  id: number
  name: string
  category: string
  assessmentId: number
  isExpired: boolean
  isExternal: boolean
  additionalTime: number | null
  normId: number
  normName: string
  dimensionId: number
  status: string
  startedAt?: string | null
  completedAt?: string | null
  norms?: Norm[]
  mettlScheduleRecordId?: string,
  reportIds: number[]
  simulationContentVariations?: SimulationContentVariation[]
  hoganParticipantId: string | null
  savilleUserAssessmentDetails: SavilleUserAssessmentDetails | null
  simulationUserAssessmentDetails: SimulationUserAssessmentDetails | null
  hoganUserAssessmentDetails: HoganUserAssessmentDetails | null
  pearsonUserAssessmentDetails: PearsonUserAssessmentDetails | null
  skillvueUserAssessmentDetails: SkillvueUserAssessmentDetails | null
  yoodliUserAssessmentDetails: YoodliUserAssessmentDetails | null
  mhsUserAssessmentDetails: MhsUserAssessmentDetails | null
  micrositeUserAssessmentDetails: MicrositeUserAssessmentDetails | null

  permissions: {
    updateAdditionalTime: boolean
    resetResults: boolean
    updateNorm: boolean
    remove: boolean
    rescoreResponse: boolean
    rescoreAiResponse: boolean
    resetProgress: boolean
    pushWebhook: boolean
    updateMettlSchedule: boolean
    normalizeFactorScores: boolean
    updateContentVariation: boolean
    updateSimulationTimeExtension: boolean
    markComplete: boolean
    updateMhsConfidenceInterval: boolean;
    updateMhsLeadershipBar: boolean;
    updateMhsNormRegion: boolean;
    updateMhsNormOption: boolean;
  }
  usersResultId: number
}
