import { connect } from 'react-redux'
import { closeModal, getCurrent } from 'admin/core/temp/modals'
import { get as getDatasheetField } from 'admin/core/project/datasheetFields/'

export default connect(
  state => ({ current: getCurrent(state), datasheetFields: getDatasheetField(state) }),
  {
    closeModal,
  },
)
