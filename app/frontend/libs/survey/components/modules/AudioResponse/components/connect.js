import { connect } from 'react-redux'
import { getI18n } from 'libs/survey/core/preview/FlowProcessor/selectors'

export default connect(
  ({ preview }) => ({
    type: preview.type,
    mediaUrl: preview.mediaUrl,
    I18n: getI18n(preview),
  }),
  {},
)
