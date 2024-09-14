import {
  ChangeEvent, FC, lazy, Suspense,
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
}

export const MultipleAnswerPreview: FC<Props> = ({ model, readOnly, I18n }) => {
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
    const checked = event?.target?.checked ?? false

    result.notApplicable = false

    if (value.length !== 0) {
      result.answer(parseInt(value, 10), checked)
    }

    forceUpdate()
  }

  const handleNotApplicableChange = () => {
    result.answers = []
    result.notApplicable = true
    result.reduxAnswer()

    forceUpdate()
  }

  if (withImageChoice) {
    return (
      <Suspense fallback={<Spin />}>
        <ImageChoices
          id={id}
          isImagePreviewEnable={isImagePreviewEnable}
          multiple
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
  handleChoiceChange(event: ChangeEvent<HTMLInputElement>, index?: number): void
  handleNotApplicableChange(): void
}

const TextChoices: FC<TextChoicesProps> = ({
  id,
  position,
  choicesIds,
  answers,
  notApplicable,
  isNotApplicableChecked,
  defaultChoiceText,
  readOnly,
  I18n,
  model,
  handleChoiceChange,
  handleNotApplicableChange,
}) => {
  const listStyles = {
    display: position === 'Vertical' ? 'block' : 'flex',
  }

  return (
    <ol
      className={cs(styles.list, styles[position], styles.multipleAnswer)}
      style={listStyles}
    >
      {choicesIds.map((choiceId) => {
        const choice = answers.find(answer => answer.index === choiceId)
        const choiceAnswer = choice?.value ?? false

        return (
          <li
            className={`${styles.listItem} ${styles.liButton} ${
              choiceAnswer ? styles.buttonActive : ''
            }`}
            key={choiceId}
          >
            <label className={`${styles.label} ${styles.labelButton}`}>
              <span className={cs('fa fa-check', styles.checkIcon)} />
              <input
                type="checkbox"
                name={`${id}`}
                className={styles.input}
                disabled={readOnly}
                value={choiceId}
                checked={choiceAnswer}
                onChange={handleChoiceChange}
                aria-labelledby={`answer-desc-${choiceId}`}
              />
              <div id={`answer-desc-${choiceId}`} className={styles.optionDescription}>
                {I18n.tQuestion(model, `choicesTexts${choiceId + 1}`, {
                  choice: choiceId,
                }) || defaultChoiceText(choiceId + 1)}
              </div>
            </label>
          </li>
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
    </ol>
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
  <li
    className={`${styles.listItem} ${styles.liButton} ${
      checked ? styles.buttonActive : ''
    }`}
  >
    <label className={`${styles.label} ${styles.labelButton}`}>
      <span className={cs('fa fa-check', styles.checkIcon)} />
      <input
        type="checkbox"
        className={styles.input}
        disabled={readOnly}
        name={`${id}`}
        value=""
        onClick={onChange}
        aria-labelledby={`not-applicable-${id}`}
      />
      <span id={`not-applicable-${id}`}>{I18n.tQuestion(model, 'notApplicableLabel')}</span>
    </label>
  </li>
)

export default MultipleAnswerPreview
