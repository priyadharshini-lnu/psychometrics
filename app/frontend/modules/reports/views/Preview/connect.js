import { connect } from 'react-redux'

export default connect(
  ({ report }, { moduleOverrides }) => ({
    loaded: report.builder.loaded,
    richEditorOpened: report.builder.richEditorOpened,
    moduleOverrides: moduleOverrides || report.builder.moduleOverrides,
  }),
  {},
)
