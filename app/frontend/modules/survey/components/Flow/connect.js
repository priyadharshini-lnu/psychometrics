import { connect } from 'react-redux'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { getTree } from '~/modules/survey/core/builder/flow/selectors'
import {
  addElementBelow, duplicateElement, addNew, updateTree, removeElement, reset, updateElement,
} from '~/modules/survey/core/builder/flow/actions'
import {
  updateFlow,
} from '~/modules/survey/core/builder/assessment/actions'
import { allQuestions, blocksWithoutDeleted } from '~/modules/survey/core/builder/assessment/selectors'

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
    updateFlow,
    updateElement,
  },
)
