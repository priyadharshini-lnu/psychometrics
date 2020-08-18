import { connect } from 'react-redux'
import { openModal } from 'modules/admin/core/ui/modals'
import {
  fetch,
  destroy,
  get as getCodes,
} from 'modules/admin/modules/campaigns/core/registrationCodes'

export default connect(
  state => ({
    ...getCodes(state),
  }),
  {
    fetch,
    destroy,
    openModal,
  },
)
