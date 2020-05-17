import { connect } from 'react-redux'
import { open } from '../../core/temp/colorPicker'

export default connect(
  () => ({}), { openPicker: open },
)
