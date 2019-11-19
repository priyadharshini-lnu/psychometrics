import { connect } from 'react-redux'
import { close } from 'libs/survey/core/modals'
import { getTree } from 'libs/survey/core/builder/flow/selectors'
import {
  addElementBelow, duplicateElement, addNew, updateTree, removeElement, reset,
} from 'libs/survey/core/builder/flow/actions'

export default connect(
  state => ({
    show: state.survey.modals.flow.show,
    ...state.survey.modals.flow.data,
    tree: getTree(state),
    assessment: state.survey.builder.assessment,
    flow: state.survey.builder.flow,
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
