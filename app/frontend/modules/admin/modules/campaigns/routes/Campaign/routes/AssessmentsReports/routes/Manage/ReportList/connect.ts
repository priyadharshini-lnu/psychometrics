import { connect, ConnectedProps } from 'react-redux'
import {
  get as getReports,
  selectRecords, toggleAssessorAccess,
  exportData,
} from 'modules/admin/modules/campaigns/core/reports'
import { RootState } from 'modules/admin/core/rootReducers'
import { openModal } from 'modules/admin/core/ui/modals'

const connecter = connect(
  (state: RootState) => ({
    reports: getReports(state),
  }),
  {
    openModal,
    selectRecords,
    toggleAssessorAccess,
    exportData,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
