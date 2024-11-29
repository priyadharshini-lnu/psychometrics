import { connect } from 'react-redux'
import { closeRichEditor } from '~/modules/reports/core/builder/actions'

export default connect(
  state => ({
    selected: state.report.builder.selected,
  }),
  {
    closeRichEditor,
  },
)
