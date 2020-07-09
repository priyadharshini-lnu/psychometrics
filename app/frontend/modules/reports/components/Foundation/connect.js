import { connect } from 'react-redux'
import { closeRichEditor, selectModule, unselectModules } from 'modules/reports/core/builder/actions'

export default connect(
  state => ({
    selected: state.report.builder.selected,
  }),
  {
    selectModule,
    unselectModules,
    closeRichEditor,
  },
)
