import { connect, ConnectedProps } from 'react-redux'
import { get as getAssessments } from '~/modules/admin/modules/campaigns/core/assessments'
import {
  rescoreResponses, remove, exportRawResults, exportScoringResults, exportOccupations,
  exportNormedResults, exportRawFactorScores, enableUniversalLink, exportExternalResults, updateExternalConfig,
  updatePrework, updateWorkshopActivity, toggleRequireScheduling, toggleAutoAssign, updateMettlSchedule,
  normalizeFactorScores, updateContentVariation, UPDATE_CONTENT_VARIATION, UPDATE_METTL_SCHEDULE,
} from '~/modules/admin/modules/campaigns/core/assessments/actions'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isRequestInProgress } from '~/core/request'

const connecter = connect(
  (state: RootState) => ({
    assessments: getAssessments(state),
    currentUser: state.currentUser,
    reports: state.campaigns.reports.list,
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
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
