import {
  ChangeEvent, FC, lazy, Suspense, useRef,
} from 'react'
import { Spin } from 'antd'
import cs from 'classnames'

import useForceUpdate from '~/hooks/useUpdate'

import { PreviewModel } from '~/modules/survey/interfaces/questions/MultipleChoice'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

import styles from '../../styles.less'

const ImageChoices = lazy(() => import('../ImageChoicePreview'))

interface Props {
  model: PreviewModel
  readOnly: boolean
  I18n: I18nInterface
  nextPage: () => {}
  singleQuestionFlow?: boolean
  focus: boolean
}

export const SingleAnswerPreview: FC<Props> = ({
  model, readOnly, I18n, nextPage, singleQuestionFlow, focus,
}) => {
  const forceUpdate = useForceUpdate()
  const {
    id,
    result,
    moduleConfig,
    choicesIds,
    props: {
      notApplicable,
      withImageChoice,
      position,
      imageChoiceSize,
      isImagePreviewEnable,
    },
  } = model

  const handleChoiceChange = (event?: ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value ?? ''

    result.notApplicable = false

    if (value.length !== 0) {
      result.answer(parseInt(value, 10))
    }
    if (singleQuestionFlow) {
      nextPage()
    }
    forceUpdate()
  }

  const handleNotApplicableChange = () => {
    result.answers = []
    result.notApplicable = true
    result.reduxAnswer()
    if (singleQuestionFlow) {
      nextPage()
    }
    forceUpdate()
  }

  if (withImageChoice) {
    return (
      <Suspense fallback={<Spin />}>
        <ImageChoices
          id={id}
          isImagePreviewEnable={isImagePreviewEnable}
          imageChoiceSize={imageChoiceSize}
          defaultChoiceText={moduleConfig.defaultChoiceText}
          choicesIds={choicesIds}
          answers={result.answers}
          notApplicable={notApplicable}
          isNotApplicableChecked={result.notApplicable}
          readOnly={readOnly}
          model={model}
          I18n={I18n}
          handleChoiceChange={handleChoiceChange}
          handleNotApplicableChange={handleNotApplicableChange}
        />
      </Suspense>
    )
  }

  return (
    <TextChoices
      id={id}
      position={position}
      choicesIds={choicesIds}
      answers={result.answers}
      defaultChoiceText={moduleConfig.defaultChoiceText}
      notApplicable={notApplicable}
      isNotApplicableChecked={result.notApplicable}
      readOnly={readOnly}
      model={model}
      I18n={I18n}
      handleChoiceChange={handleChoiceChange}
      handleNotApplicableChange={handleNotApplicableChange}
      focusFirstInput={focus}
    />
  )
}

interface TextChoicesProps {
  id: PreviewModel['id']
  position: PreviewModel['props']['position']
  choicesIds: PreviewModel['choicesIds']
  answers: PreviewModel['result']['answers']
  notApplicable: PreviewModel['props']['notApplicable']
  isNotApplicableChecked: PreviewModel['result']['notApplicable']
  defaultChoiceText: PreviewModel['moduleConfig']['defaultChoiceText']
  readOnly: boolean
  I18n: I18nInterface
  model: PreviewModel
  handleChoiceChange(event: ChangeEvent<HTMLInputElement>): void
  handleNotApplicableChange(): void
  focusFirstInput: boolean
}

const TextChoices: FC<TextChoicesProps> = ({
  id,
  position,
  choicesIds,
  answers,
  isNotApplicableChecked,
  defaultChoiceText,
  notApplicable,
  readOnly,
  model,
  I18n,
  handleChoiceChange,
  handleNotApplicableChange,
  focusFirstInput,
}) => {
  const listStyles = {
    display: position === 'Vertical' ? 'block' : 'flex',
  }
  const firstInputRef = useRef<HTMLInputElement>(null)

  if (focusFirstInput && firstInputRef.current) {
    firstInputRef.current.focus()
  }

  return (
    <div
      className={cs(styles.list, styles[position], styles.singleAnswer)}
      style={listStyles}
    >
      {choicesIds.map((choiceId, index) => {
        const choice = answers.find(answer => answer.index === choiceId)
        const choiceAnswer = choice?.value ?? false
        const focusInput = index === 0 && focusFirstInput

        return (
          <div
            className={`${styles.listItem} ${styles.liButton} ${
              choiceAnswer ? styles.buttonActive : ''
            }`}
            key={choiceId}
          >
            <label className={`${styles.label} ${styles.labelButton}`}>
              <span aria-hidden="true" className={cs('fa fa-check', styles.checkIcon)} />
              <input
                type="radio"
                name={`${id}`}
                className={cs(styles.input, { [styles.showFocusRing]: focusInput })}
                disabled={readOnly}
                value={choiceId}
                checked={choiceAnswer}
                aria-describedby={`error-for-question-${model.id}`}
                onChange={handleChoiceChange}
                aria-labelledby={`answer-desc-${choiceId}`}
                ref={index === 0 ? firstInputRef : null}
              />
              <span className={styles.optionDescription}>
                {I18n.tQuestion(model, `choicesTexts${choiceId + 1}`, {
                  choice: choiceId,
                }) || defaultChoiceText(choiceId + 1)}
              </span>
            </label>
          </div>
        )
      })}
      {notApplicable && (
        <NotApplicableTextChoice
          id={id}
          model={model}
          readOnly={readOnly}
          I18n={I18n}
          checked={isNotApplicableChecked}
          onChange={handleNotApplicableChange}
        />
      )}
    </div>
  )
}

interface NotApplicableTextChoiceProps {
  id: Props['model']['id']
  model: Props['model']
  readOnly: Props['readOnly']
  I18n: Props['I18n']
  checked?: boolean
  onChange(): void
}

const NotApplicableTextChoice: FC<NotApplicableTextChoiceProps> = ({
  id,
  model,
  readOnly,
  I18n,
  checked,
  onChange,
}) => (
  <div
    className={`${styles.listItem} ${styles.liButton} ${
      checked ? styles.buttonActive : ''
    }`}
  >
    <label className={`${styles.label} ${styles.labelButton}`}>
      <span aria-hidden="true" className={cs('fa fa-check', styles.checkIcon)} />
      <input
        type="radio"
        name={`${id}`}
        className={styles.input}
        disabled={readOnly}
        checked={checked}
        value=""
        onChange={onChange}
      />
      <span>{I18n.tQuestion(model, 'notApplicableLabel')}</span>
    </label>
  </div>
)

export default SingleAnswerPreview
