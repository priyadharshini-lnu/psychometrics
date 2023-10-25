import { connect, ConnectedProps } from 'react-redux'
import { get as getAssessments } from '~/modules/admin/modules/campaigns/core/assessments'
import {
  activateUniversalLink, rescoreResponses, remove, exportRawResults, exportScoringResults,
  exportNormedResults, exportRawFactorScores, exportExternalResults, updateExternalConfig,
  updatePrework, updateWorkshopActivity, toggleRequireScheduling,
} from '~/modules/admin/modules/campaigns/core/assessments/actions'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'

const connecter = connect(
  (state: RootState) => ({
    assessments: getAssessments(state),
    currentUser: state.currentUser,
    reports: state.campaigns.reports.list,
  }),
  {
    openModal,
    activateUniversalLink,
    rescoreResponses,
    remove,
    exportRawResults,
    exportScoringResults,
    exportNormedResults,
    exportRawFactorScores,
    exportExternalResults,
    updateExternalConfig,
    updatePrework,
    updateWorkshopActivity,
    toggleRequireScheduling,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
