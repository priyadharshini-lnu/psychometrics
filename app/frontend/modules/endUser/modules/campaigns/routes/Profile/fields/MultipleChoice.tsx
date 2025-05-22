
import { FC } from 'react'
import { Select, Radio, Checkbox } from 'antd'
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
  translations: {}
  value: string | string[]
  locked: boolean
  defaultValue?: string
  onChange: (value:string | string[]) => void
}

const { I18n } = window

const MultipleOptions = ({
  field, value, onChange, defaultValue, locked, translations,
}) => {
  const {
    props: { choices },
  } = field

  const change = (e) => {
    if (_.includes(value, e.target.value.toString())) {
      onChange(_.filter(value, v => v !== e.target.value.toString()))
    } else {
      onChange([...(value || []), e.target.value.toString()])
    }
  }
  return (
    <>
      {_.times(choices, (choiceId) => {
        const choice = _.includes((value ?? defaultValue), choiceId.toString())
        return (
          <label key={choiceId} className={`${styles.label}`}>
            <Checkbox
              type="checkbox"
              disabled={locked}
              value={choiceId}
              checked={choice}
              onChange={change}
            />
            <span className={styles.option}>
              {translations[`choicesTexts${choiceId + 1}`] || field.props.choicesTexts[choiceId]}
            </span>
          </label>
        )
      })}
    </>
  )
}

export const MultipleChoice: FC<Props> = ({
  field, value, onChange, defaultValue, locked, translations,
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
              <Radio
                disabled={locked}
                type="radio"
                name={`${id}`}
                value={choiceId}
                checked={choice}
                onChange={change}
              />
              <span className={styles.option}>
                {translations[`choicesTexts${choiceId + 1}`] || field.props.choicesTexts[choiceId]}
              </span>
            </label>
          )
        })}
      </>
    )
  }

  if (field.props.type === 'MultipleAnswer') {
    return (
      <MultipleOptions
        locked={locked}
        field={field}
        value={value}
        onChange={onChange}
        defaultValue={defaultValue}
        translations={translations}
      />
    )
  }

  if (field.props.type === 'Dropdown') {
    return (
      <Select
        size="large"
        disabled={locked}
        onChange={value => onChange(value)}
        value={`${value ?? defaultValue ?? ''}`}
      >
        <Select.Option value="">{I18n.t('common.text.select')}</Select.Option>
        {_.times(choices, choiceId => (
          <Select.Option key={choiceId} value={field.props.choicesTexts[choiceId]}>
            {translations[`choicesTexts${choiceId + 1}`] || field.props.choicesTexts[choiceId]}
          </Select.Option>
        ))}
      </Select>
    )
  }

  return null
}
