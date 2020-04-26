import { connect } from 'react-redux'
import { updateMetaData, updateMetaDataLocally } from 'core/preview/FlowProcessor/actions'
import { getCurrentBlock, getI18n } from 'core/preview/FlowProcessor/selectors'

export default connect(
  ({ preview, preview: { initialized, metaData } }) => {
    if (!initialized) return
    const block = getCurrentBlock(preview)
    return {
      preview,
      block,
      highlights: (metaData[block.id] && metaData[block.id].highlights) || [],
      I18n: getI18n(preview),
    }
  },
  {
    updateMetaData,
    updateMetaDataLocally,
  },
)
