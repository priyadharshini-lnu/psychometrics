import { connect, ConnectedProps } from 'react-redux'
import { FETCH_ASSESSMENTS_AND_REPORTS } from '~/modules/admin/modules/campaigns/core/current'
import { get as getAssessments } from '~/modules/admin/modules/campaigns/core/assessments'
import { isRequestInProgress } from '~/core/request'
import {
  rescoreResponses, remove, exportRawResults, exportScoringResults, exportOccupations,
  exportNormedResults, exportRawFactorScores, enableUniversalLink, exportExternalResults, updateExternalConfig,
  updatePrework, updateWorkshopActivity, toggleRequireScheduling, toggleAutoAssign, updateMettlSchedule,
  normalizeFactorScores, updateContentVariation, UPDATE_CONTENT_VARIATION, UPDATE_METTL_SCHEDULE,
  updatePearsonVariation,
} from '~/modules/admin/modules/campaigns/core/assessments/actions'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'

const connecter = connect(
  (state: RootState) => ({
    assessments: getAssessments(state),
    currentUser: state.currentUser,
    reports: state.campaigns.reports.list,
    isLoadingAssessmentsAndReports: isRequestInProgress(state, FETCH_ASSESSMENTS_AND_REPORTS),
    loadingUpdateContentVariation: isRequestInProgress(state, UPDATE_CONTENT_VARIATION),
    loadingUpdateMettlSchedule: isRequestInProgress(state, UPDATE_METTL_SCHEDULE),
  }),
  {
    openModal,
    rescoreResponses,
    remove,
    exportRawResults,
    exportScoringResults,
    exportNormedResults,
    exportRawFactorScores,
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
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
