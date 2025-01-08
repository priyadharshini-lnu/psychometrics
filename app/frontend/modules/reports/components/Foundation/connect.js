import { connect } from 'react-redux'
import { closeRichEditor } from '~/modules/reports/core/builder/actions'

export default connect(
  state => ({
    selected: state.report.builder.selected,
    pageSize: state.report.builder.props.sizes,
    flipContent: state.report.builder.flip_content,
    defaultLanguage: state.report.builder.default_language,
  }),
  {
    closeRichEditor,
  },
)
