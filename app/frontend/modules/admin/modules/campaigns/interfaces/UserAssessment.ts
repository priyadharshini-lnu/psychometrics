import Norm from './Norm'

import SimulationContentVariation from './SimulationContentVariation'

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
  simulationContentVariationId: string | null
  simuationTimeExtension: number | null
  hoganParticipantId: string | null
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
