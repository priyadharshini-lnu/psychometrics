import { connect } from 'react-redux'

export default connect(
  ({ report }) => ({
    loaded: report.builder.loaded,
    richEditorOpened: report.builder.richEditorOpened,
    skipLogic: report.builder.skipLogic,
  }),
  {},
)
