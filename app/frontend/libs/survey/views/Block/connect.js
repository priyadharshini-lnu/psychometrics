import { connect } from 'react-redux'
import { open } from 'libs/survey/core/modals'
import { createBlock, addQuestion } from 'libs/survey/core/builder/assessment/block/actions'

export default connect(
  () => ({}),
  {
    openRandomization: data => open('randomization', data),
    createBlock,
    addQuestion,
  },
)
