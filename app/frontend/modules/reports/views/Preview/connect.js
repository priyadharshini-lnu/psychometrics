import { connect } from 'react-redux'

export default connect(
  ({ report }, { moduleOverrides }) => ({
    loaded: report.builder.loaded,
    richEditorOpened: report.builder.richEditorOpened,
    pdfExport: report.builder.pdfExport,
    moduleOverrides: moduleOverrides || report.builder.moduleOverrides,
    skipLogic: report.builder.skipLogic,
    flipContent: report.builder.flip_content,
  }),
  {},
)
