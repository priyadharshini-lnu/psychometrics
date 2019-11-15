import { connect } from 'react-redux'
import { open } from 'libs/survey/core/modals'

export default connect(
  () => ({}),
  {
    openRichEditor: data => open('richEditor', data),
  },
)
