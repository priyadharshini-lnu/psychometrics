import { connect } from 'react-redux'
import { closeModal, getCurrent, getData } from 'modules/admin/core/temp/modals'
import { get as getDatasheetField } from 'modules/admin/core/project/datasheetFields/'

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
