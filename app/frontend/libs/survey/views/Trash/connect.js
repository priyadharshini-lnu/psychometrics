import { connect } from 'react-redux'
import { emptyTrash } from 'core/builder/assessment/actions'
import { trashItems } from 'core/builder/assessment/selectors'

export default connect(
  state => ({
    trash: trashItems(state),
  }),
  {
    emptyTrash,
  },
)
