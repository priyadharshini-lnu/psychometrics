import { connect } from 'react-redux'
import { isRequestInProgress } from '~/core/request'
import { openModal } from '~/modules/admin/core/ui/modals'
import {
  FETCH,
  fetch,
  destroy,
  get as getCodes,
} from '~/modules/admin/modules/campaigns/core/registrationCodes'
import { RootState } from '~/modules/admin/core/rootReducers'

export default connect(
  (state: RootState) => ({
    ...getCodes(state),
    isLoadingCodes: isRequestInProgress(state, FETCH),
  }),
  {
    fetch,
    destroy,
    openModal,
  },
)
