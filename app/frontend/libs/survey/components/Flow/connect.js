import { connect } from 'react-redux'
import { closeModal, getData } from 'admin/core/temp/modals'
import { getTree } from 'libs/survey/core/builder/flow/selectors'
import {
  addElementBelow, duplicateElement, addNew, updateTree, removeElement, reset,
} from 'libs/survey/core/builder/flow/actions'
import { allQuestions, blocksWithoutDeleted } from 'libs/survey/core/builder/assessment/selectors'

export default connect(
  state => ({
    ...getData(state.survey).flow,
    tree: getTree(state),
    assessment: state.survey.builder.assessment,
    flow: state.survey.builder.flow,
    questions: allQuestions(state.survey.builder),
    blocks: blocksWithoutDeleted(state.survey.builder, state.survey.builder.assessment.blocks),
  }),
  {
    close: () => closeModal('flow'),
    addElementBelow,
    duplicateElement,
    addNew,
    updateTree,
    removeElement,
    reset,
  },
)
