import { connect } from 'react-redux'
import { updateHighlight } from 'core/preview/FlowProcessor/actions'
import { getCurrentBlock, getI18n, getHighlightByType } from 'core/preview/FlowProcessor/selectors'

export default connect(
  ({ preview, preview: { initialized } }) => {
    if (!initialized) return
    const block = getCurrentBlock(preview)
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
