import { connect } from 'react-redux'
import { closeModal, getData } from 'admin/core/temp/modals'
import { addQuestion, createBlock } from 'core/builder/assessment/block/actions'
import { createQuestions } from 'core/builder/assessment/question/actions'
import { selectBlock } from 'libs/survey/core/builder/assessment/selectors'

export default connect(
  ({ survey, survey: { builder } }) => ({
    ...getData(survey).createByTemplate,
    block: getData(survey).createByTemplate ? selectBlock(builder, getData(survey).createByTemplate.blockId) : null,
  }),
  {
    close: () => closeModal('createByTemplate'),
    addQuestion,
    createBlock,
    createQuestions,
  },
)
