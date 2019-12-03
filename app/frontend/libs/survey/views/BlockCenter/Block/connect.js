import { connect } from 'react-redux'
import { selectQuestion, unselectQuestion } from 'libs/survey/core/builder/assessment/actions'
import { open } from 'libs/survey/core/modals'
import { createBlock } from 'libs/survey/core/builder/assessment/block/actions'

export default connect(
  ({ survey: { builder: { assessment: { timestemp, propPanel } } } }) => ({
    selectedModel: propPanel.question,
    timestemp, // NOTE: @fedor used to fake update
  }),
  {
    select: selectQuestion,
    unselect: unselectQuestion,
    openDisplayLogic: data => open('displayLogic', data),
    openDefaultValue: data => open('defaultValue', data),
    openRandomization: data => open('randomization', data),
    createBlock,
  },
)
