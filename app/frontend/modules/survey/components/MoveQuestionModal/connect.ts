import { connect, ConnectedProps } from 'react-redux'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { moveQuestionToPosition } from '~/modules/survey/core/builder/assessment/block/actions'
import { allQuestions } from '~/modules/survey/core/builder/assessment/selectors'
import { RootState } from '~/modules/survey/core/rootReducers'

interface Question {
  id: number
  deleted?: boolean
  type?: string
  display_logic?: object
  skip_logic?: object[]
  required_validation?: { enabled: boolean, type: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>
  hidden?: boolean
  isNeedToAddLtrManually?: boolean
  name?: string
}

const connector = connect(
  (state:RootState) => {
    const modalData = getData(state.survey).moveQuestion
    const currentQuestion = modalData?.question
    const allSurveyQuestions = allQuestions(state.survey.builder) as unknown as { [id: string]: Question }
    const questions = Object.values(allSurveyQuestions)
      .filter(q => q.id !== currentQuestion?.id)

    return {
      currentQuestion,
      questions,
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
