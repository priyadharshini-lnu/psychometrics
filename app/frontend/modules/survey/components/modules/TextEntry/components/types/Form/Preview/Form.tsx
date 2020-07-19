import _ from 'lodash'
import React from 'react'
import { I18n } from 'store/StoreWatchman'
import styles from '../FormStyle.scss'
import commonStyles from '../../../TextEntry.scss'
import inputs from './inputs'
import { Question } from '../interfaces'
import { FormType } from '../interfaces/Question'

interface Props {
  model: Question
}

const INPUT_TYPE = { name: 'Input' }

const Form: React.FC<Props> = ({
  model, model: {
    name, id, choicesIds, props: { formTypes }, moduleConfig,
  },
}) => {
  const getType = (i: number): FormType => {
    if (!formTypes) return INPUT_TYPE
    return formTypes[i] || INPUT_TYPE
  }

  const changeAnswer = (i: number, value: string | string[]): void => {
    model.result.answer(i, value)
  }

  const renderInput = (i: number): React.ReactNode => {
    const { name: inputName } = getType(i)
    const Input = inputs[inputName]
    return <Input name={`choice_${name}_${id}`} index={i} model={model} onChange={changeAnswer} />
  }

  return (
    <ul className={commonStyles.list}>
      {_.map(choicesIds, (i: number) => (
        <li className={styles.listItem} key={i}>
          <span className={styles.previewLabel}>
            {I18n().tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                || moduleConfig.defaultChoiceText(i + 1)}
          </span>
          <div className={styles.inputContainer}>
            {renderInput(i)}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default Form
