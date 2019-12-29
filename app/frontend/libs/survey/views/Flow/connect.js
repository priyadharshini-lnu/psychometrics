import { connect } from 'react-redux'
import { close } from 'libs/survey/core/modals'
import { getTree } from 'libs/survey/core/builder/flow/selectors'
import {
  addElementBelow, duplicateElement, addNew, updateTree, removeElement, reset,
} from 'libs/survey/core/builder/flow/actions'
import { allQuestions, blocksWithoutDeleted } from 'libs/survey/core/builder/assessment/selectors'

export default connect(
  state => ({
    show: state.survey.modals.flow.show,
    ...state.survey.modals.flow.data,
    tree: getTree(state),
    assessment: state.survey.builder.assessment,
    flow: state.survey.builder.flow,
    questions: allQuestions(state.survey.builder),
    blocks: blocksWithoutDeleted(state.survey.builder, state.survey.builder.assessment.blocks),
  }),
  {
    close: () => close('flow'),
    addElementBelow,
    duplicateElement,
    addNew,
    updateTree,
    removeElement,
    reset,
  },
)
