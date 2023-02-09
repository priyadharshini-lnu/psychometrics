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

const SingleAnswerPreview = lazy(
  () => import(/* webpackChunkName: "mc-singleAnswerPreview" */ './components/types/SingleAnswerPreview'),
)
const MultipleAnswerPreview = lazy(
  () => import(/* webpackChunkName: "mc-multipleAnswerPreview" */ './components/types/MultipleAnswerPreview'),
)
const DropdownPreview = lazy(
  () => import(/* webpackChunkName: "mc-dropdownPreview" */ './components/types/DropdownPreview'),
)
const SelectBoxPreview = lazy(
  () => import(/* webpackChunkName: "mc-selectBoxPreview" */ './components/types/SelectBoxPreview'),
)
const MultiSelectBoxPreview = lazy(
  () => import(/* webpackChunkName: "mc-multiSelectBoxPreview" */ './components/types/MultiSelectBoxPreview'),
)

interface OwnProps {
  model: PreviewModel
  readOnly: boolean
  nextPage: () => {}
}

const connector = connect(
  ({ preview }: RootState, { model: { id } }: OwnProps) => ({
    showQuestionScoring: preview.showQuestionScoring,
    factors: preview.factors,
    scores: getQuestionScoring(preview, id),
    I18n: getI18n(preview),
    singleQuestionFlow: preview.enableSingleQuestionPage,
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
  singleQuestionFlow,
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
    singleQuestionFlow,
  }

  return (
    <div>
      <Suspense fallback={<Spin />}>
        <SafeHTML
          html={I18n.tQuestion(model, 'questionText')}
          className={`mb-4 ${isNeedToAddLtrManually ? 'ltr' : ''}`}
          config="adminRichText"
        />
        {type === 'SingleAnswer' && (
          <SingleAnswerPreview {...answerTypeProps} />
        )}
        {type === 'MultipleAnswer' && (
          <MultipleAnswerPreview {...answerTypeProps} />
        )}
        {type === 'Dropdown' && <DropdownPreview {...answerTypeProps} />}
        {type === 'SelectBox' && <SelectBoxPreview {...answerTypeProps} />}
        {type === 'MultiSelectBox' && (
          <MultiSelectBoxPreview {...answerTypeProps} />
        )}
        {showQuestionScoring && scores && size(scores) !== 0 && (
          <div>
            <ScoringTable factors={factors} scoring={scores} I18n={I18n} />
          </div>
        )}
      </Suspense>
    </div>
  )
}

export const Preview = connector(PreviewComponent)
