import React, { useState } from 'react'
import { Input } from 'antd'
import _ from 'lodash'
import { I18n } from 'store/StoreWatchman'
import styles from '../commonStyles.scss'
import ContactSelect from './ContactSelect'
import {
  TO_TYPE, CC_TYPE, BCC_TYPE, ViewEnum,
} from '../constants'
import { ContactType } from '../interfaces/Email'
import { Question } from '../interfaces'

interface Props {
  model: Question
  readOnly?: boolean
  setView: (view: ViewEnum) => void
}

interface ContactProps {
  type: ContactType
  visible: boolean
}

const { TextArea } = Input

const Form: React.FC<Props> = ({ model, readOnly }) => {
  const { answers: { message } } = model.result
  const { maxLength } = model.props
  const defaultContactProps: ContactProps[] = [
    { type: TO_TYPE, visible: true },
    { type: CC_TYPE, visible: !_.isEmpty(model.result.answers[CC_TYPE]) },
    { type: BCC_TYPE, visible: !_.isEmpty(model.result.answers[BCC_TYPE]) },
  ]

  const [contactProps, setContactProps] = useState<ContactProps[]>(defaultContactProps)

  const toggleCopyField = (type: ContactType): void => {
    setContactProps(contactProps.map(p => (p.type === type ? { ...p, visible: !p.visible } : p)))
  }

  const handleTestChange = (key: string, value: string): void => {
    model.result.answer({ ...model.result.answers, [key]: value })
  }

  const remainingLength = (maxLength || 0) - (message?.length || 0)

  return (
    <div className={styles.emailForm}>
      {contactProps.filter(({ visible }) => visible).map(({ type }, i) => (
        <ContactSelect key={i} model={model} toggleCopyField={toggleCopyField} type={type} readOnly={readOnly} />
      ))}
      <div className={styles.subject}>
        <div>{I18n().t('threesixty.question.email_type.subject')}</div>
        <Input
          value={model.result.answers.subject}
          onChange={({ target: { value } }): void => handleTestChange('subject', value)}
          disabled={readOnly}
        />
      </div>
      <div>
        <div>{I18n().t('threesixty.question.email_type.message')}</div>
        <TextArea
          className={styles.message}
          value={message}
          rows={7}
          onChange={({ target: { value } }): void => handleTestChange('message', value)}
          disabled={readOnly}
          maxLength={maxLength}
        />
        {maxLength
         && (
         <small>
           {I18n().t('threesixty.question.email_type.max_length_warning', { x: remainingLength })}
         </small>
         )
         }
      </div>
    </div>
  )
}

export default Form
