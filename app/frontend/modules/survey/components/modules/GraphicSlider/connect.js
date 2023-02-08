import { connect } from 'react-redux'
import { getI18n } from '~/modules/survey/core/preview/FlowProcessor/selectors'

export default connect(({ preview }) => ({ I18n: getI18n(preview) }), {})
