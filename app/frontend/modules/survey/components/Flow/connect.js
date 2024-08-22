import { connect } from 'react-redux'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { getTree } from '~/modules/survey/core/builder/flow/selectors'
import { actions } from '~/modules/survey/core/builder/flow'
import {
  updateFlow,
} from '~/modules/survey/core/builder/assessment/actions'
import { allQuestions, blocksWithoutDeleted } from '~/modules/survey/core/builder/assessment/selectors'

export default connect(
  state => ({
    ...getData(state.survey).flow,
    tree: getTree(state.survey.builder.flow),
    assessment: state.survey.builder.assessment,
    questions: allQuestions(state.survey.builder),
    blocks: blocksWithoutDeleted(state.survey.builder, state.survey.builder.assessment.blocks),
  }),
  {
    close: () => closeModal('flow'),
    updateFlow,
    ...actions,
  },
)
