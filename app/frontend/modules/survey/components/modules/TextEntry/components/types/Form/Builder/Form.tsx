import _ from 'lodash'
import React from 'react'
import { Select } from 'antd'

import LabelEditor from '~/modules/survey/components/LabelEditor'
import { DateEntry } from '~/modules/survey/components/modules/TextEntry/components/types/Form/Builder/inputs/DateEntry'

import { BuilderModel, DateFormat } from '~/modules/survey/interfaces/questions/TextEntry'

import { DATE_FORMAT_OPTIONS } from '~/modules/survey/components/modules/TextEntry/constant'

import inputs from './inputs'

import styles from '../FormStyle.less'
import commonStyles from '../../../styles.less'

interface Props {
  model: BuilderModel
}

const { Option } = Select

const INPUT_TYPE_LIST: BuilderModel['props']['formTypes'] = [
  { name: 'Input' },
  { name: 'TextArea' },
  { name: 'Checkbox' },
  {
    name: 'Select',
    optionList: {
      option1: 'Option 1',
      option2: 'Option 2',
    },
  },
  {
    name: 'MultiSelect',
    optionList: {
      option1: 'Option 1',
      option2: 'Option 2',
    },
  },
  { name: 'Date', dateFormat: DateFormat['DD-MM-YYYY'] },
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
      const foundedInputType = INPUT_TYPE_LIST.find(({ name }) => name === inputName)
      if (index === i && foundedInputType !== undefined) {
        return foundedInputType
      }

      return formTypes[i] || INPUT_TYPE_LIST[0]
    })
    model.changeProps({ formTypes: [...newTypes, ...formTypes.slice(index + 1)] })
  }

  const getType = (i: number): BuilderModel['props']['formTypes'][0] => {
    if (!formTypes) return INPUT_TYPE_LIST[0]
    return formTypes[i] || INPUT_TYPE_LIST[0]
  }

  const handleFormsNthDateFormat = (index: number, value: string) => {
    model.changeArrayProps({ collection: 'formTypes', i: index, val: { name: 'Date', dateFormat: value } }, false)
  }

  const renderInput = (i: number): React.ReactNode => {
    const { name: inputName } = getType(i)

    if (inputName === 'Date') {
      const dateFormat = formTypes?.[i]?.dateFormat ?? DATE_FORMAT_OPTIONS[0].value

      return (
        <DateEntry
          dateFormat={dateFormat}
          onDateFormatChange={value => handleFormsNthDateFormat(i, value)}
        />
      )
    }

    const Input = inputs[inputName]
    return <Input name={`choice_${name}_${id}`} index={i} model={model} />
  }

  return (
    <ul className={commonStyles.list}>
      {_.times(choices, i => (
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
