import { connect } from 'react-redux'
import { closeModal, getData } from 'admin/core/temp/modals'

export default connect(
  ({ survey }) => ({
    ...getData(survey).pipedText,
  }),
  {
    close: () => closeModal('pipedText'),
  },
)
