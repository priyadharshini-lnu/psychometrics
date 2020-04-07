import _ from 'lodash'
import React from 'react'
import { Select } from 'antd'
import LabelEditor from 'components/LabelEditor'
import styles from '../FormStyle.scss'
import commonStyles from '../../../TextEntry.scss'
import inputs from './inputs'
import { Question } from '../interfaces'
import { FormType } from '../interfaces/Question'

interface Props {
  model: Question
}

const { Option } = Select

const INPUT_TYPE_LIST = [
  { name: 'Input' },
  { name: 'TextArea' },
  { name: 'Checkbox' },
  { name: 'Select', optionList: ['Option1', 'Option2'] },
  { name: 'MultiSelect', optionList: ['Option1', 'Option2'] },
  { name: 'Date' },
]

const Form: React.FC<Props> = ({
  model, model: {
    name, id, props: { choices, choicesTexts, formTypes = [] }, moduleConfig,
  },
}) => {
  const changeLabel = (i: number, text: string): void => {
    model.changeArrayProps({ collection: 'choicesTexts', i, val: text }, false)
  }

  const changeType = (index: number, inputName: string): void => {
    const newTypes = _.times(index + 1, (i: number) => {
      if (index === i) return INPUT_TYPE_LIST.find(({ name }) => name === inputName)
      return formTypes[i] || INPUT_TYPE_LIST[0]
    })
    model.changeProps({ formTypes: [...newTypes, ...formTypes.slice(index + 1)] })
  }

  const getType = (i: number): FormType => {
    if (!formTypes) return INPUT_TYPE_LIST[0]
    return formTypes[i] || INPUT_TYPE_LIST[0]
  }

  const renderInput = (i: number): React.ReactNode => {
    const { name: inputName } = getType(i)
    const Input = inputs[inputName]
    return <Input name={`choice_${name}_${id}`} index={i} model={model} />
  }

  return (
    <ul className={commonStyles.list}>
      {_.times(choices, (i: number) => (
        <li className={commonStyles.listItem} key={i}>
          <LabelEditor
            value={choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
            onChange={(value: string): void => changeLabel(i, value)}
          />
          <Select className={styles.select} value={getType(i).name} onChange={(name): void => changeType(i, name)}>
            {INPUT_TYPE_LIST.map(({ name }, i) => (<Option key={i} value={name}>{name}</Option>))}
          </Select>
          <div className={styles.inputContainer}>
            {renderInput(i)}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default Form
