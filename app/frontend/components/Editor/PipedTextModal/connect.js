import { connect } from 'react-redux'
import { closeModal, getCurrent, getData } from 'admin/core/temp/modals'
import { get as getDatasheetField } from 'admin/core/project/datasheetFields/'

export default connect(
  state => ({
    current: getCurrent(state),
    data: getData(state).PipedTextModal,
    datasheetFields: getDatasheetField(state),
  }),
  {
    closeModal,
  },
)
