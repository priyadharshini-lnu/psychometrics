import { connect } from 'react-redux'
import { get as getDatasheetField } from 'admin/core/project/datasheetFields/'

export default connect(
  state => ({ datasheetFields: getDatasheetField(state) }),
  null,
)
