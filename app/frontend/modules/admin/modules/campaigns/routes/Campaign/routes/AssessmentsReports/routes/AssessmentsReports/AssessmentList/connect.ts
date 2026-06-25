import { connect, ConnectedProps } from 'react-redux'
import { FETCH_ASSESSMENTS_AND_REPORTS } from '~/modules/admin/modules/campaigns/core/current'
import { get as getAssessments } from '~/modules/admin/modules/campaigns/core/assessments'
import {
  get as getCampaignOptions,
  fetch as fetchCampaignOptions,
} from '~/modules/admin/modules/campaigns/core/campaignOptions'
import { isRequestInProgress } from '~/core/request'
import {
  rescoreResponses, remove, exportRawResults, exportScoringResults, exportOccupations,
  exportNormedResults, exportRawFactorScores, exportAiFactorScores, enableUniversalLink, exportExternalResults,
  updateExternalConfig, updatePrework, updateWorkshopActivity, toggleRequireScheduling, toggleAutoAssign,
  updateMettlSchedule, normalizeFactorScores, updateContentVariation, UPDATE_CONTENT_VARIATION, UPDATE_METTL_SCHEDULE,
  updatePearsonVariation, toggleAssessmentCaching, updateMhsConfidenceInterval, updateMhsLeadershipBar,
  updateMhsNormRegion, updateMhsNormOption, regenerateTranscriptions, updateProctoringSettings,
  UPDATE_PROCTORING_SETTINGS,
} from '~/modules/admin/modules/campaigns/core/assessments/actions'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'

const connecter = connect(
  (state: RootState) => ({
    assessments: getAssessments(state),
    campaignOptions: getCampaignOptions(state),
    currentUser: state.currentUser,
    reports: state.campaigns.reports.list,
    isLoadingAssessmentsAndReports: isRequestInProgress(state, FETCH_ASSESSMENTS_AND_REPORTS),
    loadingUpdateContentVariation: isRequestInProgress(state, UPDATE_CONTENT_VARIATION),
    loadingUpdateMettlSchedule: isRequestInProgress(state, UPDATE_METTL_SCHEDULE),
    loadingUpdateProctoringSettings: isRequestInProgress(state, UPDATE_PROCTORING_SETTINGS),
  }),
  {
    openModal,
    rescoreResponses,
    regenerateTranscriptions,
    remove,
    exportRawResults,
    exportScoringResults,
    exportNormedResults,
    exportRawFactorScores,
    exportAiFactorScores,
    exportExternalResults,
    exportOccupations,
    enableUniversalLink,
    updateExternalConfig,
    updateContentVariation,
    updatePrework,
    updateWorkshopActivity,
    toggleRequireScheduling,
    toggleAutoAssign,
    updateMettlSchedule,
    normalizeFactorScores,
    updatePearsonVariation,
    updateMhsConfidenceInterval,
    updateMhsLeadershipBar,
    updateMhsNormRegion,
    updateMhsNormOption,
    toggleAssessmentCaching,
    updateProctoringSettings,
    fetchCampaignOptions,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
