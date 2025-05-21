import Norm from './Norm'

import SimulationContentVariation from './SimulationContentVariation'

interface SavilleUserAssessmentDetails {
  dataSeprator: string | null
  candidateId: string | null
}

interface SimulationUserAssessmentDetails {
  timeExtension: number | null
  contentVariationId: string | null
  participantId: string | null
}

interface PearsonUserAssessmentDetails {
  normId: string | null
  scheduleId: string | null
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
  norms?: Norm[]
  mettlScheduleRecordId?: string,
  reportIds: number[]
  simulationContentVariations?: SimulationContentVariation[]
  hoganParticipantId: string | null
  savilleUserAssessmentDetails: SavilleUserAssessmentDetails | null
  simulationUserAssessmentDetails: SimulationUserAssessmentDetails | null
  pearsonUserAssessmentDetails: PearsonUserAssessmentDetails | null
  permissions: {
    updateAdditionalTime: boolean
    resetResults: boolean
    updateNorm: boolean
    remove: boolean
    rescoreResponse: boolean
    resetProgress: boolean
    pushWebhook: boolean
    updateMettlSchedule: boolean
    normalizeFactorScores: boolean
    updateContentVariation: boolean
    updateSimulationTimeExtension: boolean
  }
  usersResultId: number
}
