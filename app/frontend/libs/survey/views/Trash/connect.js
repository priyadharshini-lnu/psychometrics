import { connect } from 'react-redux'
import { emptyTrash } from 'core/builder/assessment/actions'
import { permanentRemoveBlock, restoreBlock, restoreQuestion } from 'core/builder/assessment/block/actions'
import { permanentRemoveQuestion } from 'core/builder/assessment/question/actions'
import { trashItems } from 'core/builder/assessment/selectors'

export default connect(
  state => ({
    trash: trashItems(state),
  }),
  {
    emptyTrash,
    permanentRemoveBlock,
    permanentRemoveQuestion,
    restoreQuestion,
    restoreBlock,
  },
)
