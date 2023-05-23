import { connect } from 'react-redux'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { addQuestion, createBlock } from '~/modules/survey/core/builder/assessment/block/actions'
import { createQuestions } from '~/modules/survey/core/builder/assessment/question/actions'
import { selectBlock } from '~/modules/survey/core/builder/assessment/selectors'

export default connect(
  ({ survey, survey: { builder } }) => ({
    ...getData(survey).createByTemplate,
    block: getData(survey).createByTemplate ? selectBlock(builder, getData(survey).createByTemplate.blockId) : null,
    ownerId: builder.assessment.ownerId,
  }),
  {
    close: () => closeModal('createByTemplate'),
    addQuestion,
    createBlock,
    createQuestions,
  },
)
