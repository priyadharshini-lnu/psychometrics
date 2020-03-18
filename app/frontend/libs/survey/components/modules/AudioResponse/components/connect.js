import { connect } from 'react-redux'

export default connect(
  ({ preview }) => ({
    type: preview.type,
    mediaUrl: preview.mediaUrl,
  }),
  {},
)
