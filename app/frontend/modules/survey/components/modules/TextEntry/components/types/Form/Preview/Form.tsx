import _ from 'lodash'
import React from 'react'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import { PreviewModel } from '~/modules/survey/interfaces/questions/TextEntry'
import { DATE_FORMAT_OPTIONS } from '~/modules/survey/components/modules/TextEntry/constant'
import { SafeHTML } from '~/components/SafeHTML'
import styles from '../FormStyle.less'
import commonStyles from '../../../styles.less'
import inputs from './inputs'
import { DateEntry } from './inputs/DateEntry'
import { FormType } from '../interfaces/Question'
import useForceUpdate from '~/hooks/useUpdate'

interface Props {
  model: PreviewModel
  readOnly: boolean
}

const INPUT_TYPE = { name: 'Input' }

const Form: React.FC<Props> = ({
  model,
  model: {
    name,
    id,
    choicesIds,
    props: { formTypes },
    moduleConfig,
    result: { answers },
  },
  readOnly,
}) => {
  const getType = (i: number): FormType => {
    if (!formTypes) return INPUT_TYPE
    return formTypes[i] || INPUT_TYPE
  }

  const forceUpdate = useForceUpdate()

  const changeAnswer = (i: number, value: string | string[] | null): void => {
    model.result.answer(i, value)
    forceUpdate()
  }

  const renderInput = (i: number, inputId: string): React.ReactNode => {
    const { name: inputName } = getType(i)
    const Input = inputs[inputName]
    return (
      <Input
        id={inputId}
        name={`choice_${name}_${id}`}
        index={i}
        model={model}
        onChange={changeAnswer}
        readOnly={readOnly}
      />
    )
  }

  return (
    <ul className={commonStyles.list}>
      {_.map(choicesIds, (i: number) => {
        const { name: inputName } = getType(i)
        const inputId = `form-input-${id}-${i}`
        return (
          <li className={styles.listItem} key={i}>
            <SafeHTML
              as="label"
              htmlFor={inputId}
              className={styles.previewLabel}
              config="label"
              html={I18n().tQuestion(model, `choicesTexts${i + 1}`, { choice: i })
                || moduleConfig.defaultChoiceText(i + 1)
              }
            />
            <div className={styles.inputContainer}>
              {inputName === 'Date' && (
                <DateEntry
                  id={inputId}
                  readOnly={readOnly}
                  value={answers?.[i]?.value ?? ''}
                  dateFormat={
                    formTypes?.[i]?.dateFormat ?? DATE_FORMAT_OPTIONS[0].value
                  }
                  onChange={value => changeAnswer(i, value)}
                />
              )}
              {inputName !== 'Date' && renderInput(i, inputId)}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default Form
