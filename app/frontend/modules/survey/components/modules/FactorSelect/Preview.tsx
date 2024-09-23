import { FC, Suspense } from 'react'
import { Spin } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import {
  getI18n,
  getQuestionScoring,
} from '~/modules/survey/core/preview/FlowProcessor/selectors'

import { RootState } from '~/modules/survey/core/rootReducers'
import { PreviewModel } from '~/modules/survey/interfaces/questions/MultipleChoice'

import { SafeHTML } from '~/components/SafeHTML'
import DropdownPreview from './components/types/DropdownPreview'

interface OwnProps {
  model: PreviewModel
  readOnly: boolean
  nextPage: () => {}
  questionCount: number
}

const connector = connect(
  ({ preview }: RootState, { model: { id } }: OwnProps) => ({
    showQuestionScoring: preview.showQuestionScoring,
    factors: preview.factors,
    scores: getQuestionScoring(preview, id),
    I18n: getI18n(preview),
    enableSingleQuestionPage: preview.enableSingleQuestionPage,
  }),
)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps

export const PreviewComponent: FC<Props> = ({
  I18n,
  model,
  readOnly,
  nextPage,
  enableSingleQuestionPage,
  questionCount,
  factors,
}) => {
  const {
    props: { type },
    isNeedToAddLtrManually,
  } = model

  const answerTypeProps = {
    model,
    readOnly,
    I18n,
    nextPage,
    factors,
    singleQuestionFlow: enableSingleQuestionPage && questionCount === 1,
  }

  return (
    <div>
      <Suspense fallback={<Spin />}>
        <SafeHTML
          html={I18n.tQuestion(model, 'questionText')}
          className={`mb-4 ${isNeedToAddLtrManually ? 'ltr' : ''}`}
          config="adminRichText"
        />
        {type === 'Dropdown' && <DropdownPreview {...answerTypeProps} />}
      </Suspense>
    </div>
  )
}

export const Preview = connector(PreviewComponent)
