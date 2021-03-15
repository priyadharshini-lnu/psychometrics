import { connect, ConnectedProps } from 'react-redux'
import {
  fetch,
  get as getCampaign,
  remove,
} from 'modules/admin/modules/campaigns/core/list'
import { openModal } from 'modules/admin/core/ui/modals'
import { get as getTotal } from 'modules/admin/modules/campaigns/core/total'
import { get as getCurrentUser } from 'core/currentUser'
import { isProjectMigrated } from 'core/config'
import { RootState } from 'modules/admin/core/rootReducers'

const connecter = connect(
  (state: RootState) => ({
    list: getCampaign(state),
    total: getTotal(state),
    currentUser: getCurrentUser(state),
    isProjectMigrated: isProjectMigrated(state),
  }),
  {
    fetch,
    openModal,
    remove,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
