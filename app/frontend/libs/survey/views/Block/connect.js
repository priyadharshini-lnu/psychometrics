import { connect } from 'react-redux'
import { open } from 'libs/survey/core/modals'
import {
  createBlock, removeBlock, addQuestion,
} from 'libs/survey/core/builder/assessment/block/actions'
import { unselectQuestion, moveBlockDown, moveBlockUp } from 'libs/survey/core/builder/assessment/actions'

export default connect(
  () => ({}),
  {
    openRandomization: data => open('randomization', data),
    unselectQuestion,
    createBlock,
    removeBlock,
    addQuestion,
    moveBlockDown,
    moveBlockUp,
  },
)
