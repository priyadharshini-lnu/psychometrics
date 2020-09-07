import { connect, ConnectedProps } from 'react-redux'
import { fetchAssessmentAndReports } from 'modules/admin/modules/campaigns/core/current'
import { openModal } from 'modules/admin/core/ui/modals'
import { RootState } from 'modules/admin/core/rootReducers'
import { getSelectedIds, regenerateReports, REGENERATE_REPORTS } from 'modules/admin/modules/campaigns/core/reports'
import { isRequestInProgress } from 'modules/admin/core/request'

const connecter = connect(
  (state: RootState) => ({
    selectedIds: getSelectedIds(state),
    regenerateInProgress: isRequestInProgress(state, REGENERATE_REPORTS),
  }),
  {
    fetchAssessmentAndReports,
    openModal,
    regenerateReports,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
