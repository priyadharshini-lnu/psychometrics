import { connect } from 'react-redux'
import { emptyTrash } from '~/modules/survey/core/builder/assessment/actions'
import {
  permanentRemoveBlock, restoreBlock, restoreQuestion,
} from '~/modules/survey/core/builder/assessment/block/actions'
import { permanentRemoveQuestion } from '~/modules/survey/core/builder/assessment/question/actions'
import { trashItems } from '~/modules/survey/core/builder/assessment/selectors'

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
