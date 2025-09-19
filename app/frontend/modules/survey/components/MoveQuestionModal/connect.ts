import { connect, ConnectedProps } from 'react-redux'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { moveQuestionToPosition } from '~/modules/survey/core/builder/assessment/block/actions'
import { allQuestions } from '~/modules/survey/core/builder/assessment/selectors'
import { RootState } from '~/modules/survey/core/rootReducers'

import { Block, Question } from './types'

const connector = connect(
  (state: RootState) => {
    const modalData = getData(state.survey).moveQuestion
    const currentQuestion = modalData?.question
    const allSurveyQuestions = allQuestions(state.survey.builder) as unknown as { [id: string]: Question }
    const questions = Object.values(allSurveyQuestions)
      .filter(q => q.id !== currentQuestion?.id)

    const { blocks }: { blocks: Record<number, Block> } = state.survey.builder

    return {
      currentQuestion,
      questions,
      blocks,
      visible: !!modalData,
    }
  },
  {
    onClose: () => closeModal('moveQuestion'),
    onMove: moveQuestionToPosition,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector
