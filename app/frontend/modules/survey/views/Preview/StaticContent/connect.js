import { connect } from 'react-redux'
import { updateHighlight } from '~/modules/survey/core/preview/FlowProcessor/actions'
import { getCurrentBlock, getI18n, getHighlightByType } from '~/modules/survey/core/preview/FlowProcessor/selectors'

export default connect(
  ({ preview, preview: { initialized } }, props) => {
    if (!initialized) return
    const block = props.block || getCurrentBlock(preview)
    return {
      preview,
      block,
      highlight: getHighlightByType({ preview }, block.id, 'Block'),
      I18n: getI18n(preview),
    }
  },
  {
    updateHighlight,
  },
)
