
import React, { FC } from 'react'
import { Select, Radio, Checkbox } from 'antd'
import cs from 'classnames'
import _ from 'lodash'
import styles from './styles.less'

interface Props {
  field: {
    id: number
    props:{
      type: string
      choices: number
      choicesTexts: string[]
    }
  }
  value: string
  defaultValue?: string
  onChange: (value:string) => void
}

export const MultipleChoice: FC<Props> = ({
  field, value, onChange, defaultValue,
}) => {
  const {
    id,
    props: { choices },
  } = field

  const change = (e) => {
    onChange(e.target.value)
  }
  if (field.props.type === 'SingleAnswer') {
    return (
      <>
        {_.times(choices, (choiceId) => {
          const choice = +(value ?? defaultValue) === choiceId
          return (
            <label className={`${styles.label}`}>
              <span className={cs('fa fa-check', styles.checkIcon)} />
              <Radio
                type="radio"
                name={`${id}`}
                value={choiceId}
                checked={choice}
                onChange={change}
              />
              <span className={styles.option}>
                {field.props.choicesTexts[choiceId]}
              </span>
            </label>
          )
        })}
      </>
    )
  }

  if (field.props.type === 'MultipleAnswer') {
    return (
      <>
        {_.times(choices, (choiceId) => {
          const choice = +(value ?? defaultValue) === choiceId
          return (
            <label className={`${styles.label}`}>
              <span className={cs('fa fa-check', styles.checkIcon)} />
              <Checkbox
                type="checkbox"
                name={`${id}`}
                value={choiceId}
                checked={choice}
                onChange={change}
              />
              <span className={styles.option}>
                {field.props.choicesTexts[choiceId]}
              </span>
            </label>
          )
        })}
      </>
    )
  }

  if (field.props.type === 'Dropdown') {
    return (
      <Select
        size="large"
        onChange={value => onChange(value)}
        value={`${value ?? defaultValue ?? ''}`}
      >
        <Select.Option value="">Select...</Select.Option>
        {_.times(choices, choiceId => (
          <Select.Option key={choiceId} value={field.props.choicesTexts[choiceId]}>
            {field.props.choicesTexts[choiceId]}
          </Select.Option>
        ))}
      </Select>
    )
  }

  return null
}
