import { connect } from 'react-redux'
import { get as getDatasheetFields } from 'admin/core/project/datasheetFields'

export default connect(
  state => ({ datasheetFields: getDatasheetFields(state) }),
  {},
)
