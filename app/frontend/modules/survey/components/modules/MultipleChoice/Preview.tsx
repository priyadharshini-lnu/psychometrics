import { FC, lazy, Suspense } from 'react'
import { Spin } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import size from 'lodash/size'

import {
  getI18n,
  getQuestionScoring,
} from '~/modules/survey/core/preview/FlowProcessor/selectors'

import { RootState } from '~/modules/survey/core/rootReducers'
import { PreviewModel } from '~/modules/survey/interfaces/questions/MultipleChoice'

import { SafeHTML } from '~/components/SafeHTML'
import { ScoringTable } from './components/ScoringTable'

import styles from './Preview.less'

const SingleAnswerPreview = lazy(
  () => import(/* webpackChunkName: "mc-singleAnswerPreview" */ './components/types/SingleAnswerPreview'),
)
const MultipleAnswerPreview = lazy(
  () => import(/* webpackChunkName: "mc-multipleAnswerPreview" */ './components/types/MultipleAnswerPreview'),
)
const DropdownPreview = lazy(
  () => import(/* webpackChunkName: "mc-dropdownPreview" */ './components/types/DropdownPreview'),
)

interface OwnProps {
  model: PreviewModel
  readOnly: boolean
  nextPage: () => {}
  questionCount: number
  focus: boolean
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
  showQuestionScoring,
  factors,
  scores,
  I18n,
  model,
  readOnly,
  nextPage,
  enableSingleQuestionPage,
  questionCount,
  focus,
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
    singleQuestionFlow: enableSingleQuestionPage && questionCount === 1,
    focus,
  }

  return (
    <div>
      <Suspense fallback={<Spin />}>
        <fieldset className={styles.questionContainer}>
          <legend className={styles.questionText}>
            <SafeHTML
              html={I18n.tQuestion(model, 'questionText')}
              className={`mb-4 ${isNeedToAddLtrManually ? 'ltr' : ''}`}
              config="adminRichText"
            />
          </legend>
          {type === 'SingleAnswer' && (
          <SingleAnswerPreview {...answerTypeProps} />
          )}
          {type === 'MultipleAnswer' && (
          <MultipleAnswerPreview {...answerTypeProps} />
          )}
          {type === 'Dropdown' && <DropdownPreview {...answerTypeProps} />}
          {showQuestionScoring && scores && size(scores) !== 0 && (
          <div>
            <ScoringTable factors={factors} scoring={scores} I18n={I18n} />
          </div>
          )}
        </fieldset>
      </Suspense>
    </div>
  )
}

export const Preview = connector(PreviewComponent)
