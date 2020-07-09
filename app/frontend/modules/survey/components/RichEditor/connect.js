import { connect } from 'react-redux'
import { closeModal, getData } from 'modules/admin/core/ui/modals'

export default connect(
  ({ survey }) => ({
    ...getData(survey).richEditor,
  }),
  {
    close: () => closeModal('richEditor'),
  },
)
