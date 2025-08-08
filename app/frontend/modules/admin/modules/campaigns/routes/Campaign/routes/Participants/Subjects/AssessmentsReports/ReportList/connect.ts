import { connect, ConnectedProps } from 'react-redux'
import {
  get as getReports, remove, toggleUserAccess, selectRecords, removeFile, regenerateReports,
} from '~/modules/admin/modules/campaigns/core/userReports'
import { RootState } from '~/modules/admin/core/rootReducers'
import { openModal } from '~/modules/admin/core/ui/modals'

const connecter = connect(
  (state: RootState) => ({
    reports: getReports(state),
  }),
  {
    selectRecords,
    remove,
    regenerateReports,
    toggleUserAccess,
    openModal,
    removeFile,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
