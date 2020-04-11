import React, { useState } from 'react'
import { Input } from 'antd'
import _ from 'lodash'
import Watchman from 'store/StoreWatchman'
import styles from '../EmailStyle.scss'
import ContactSelect from './ContactSelect'
import { TO_TYPE, CC_TYPE, BCC_TYPE } from '../constants'
import { ContactType } from '../interfaces/Email'
import { Question } from '../interfaces'

interface Props {
  model: Question
  readOnly?: boolean
}

interface ContactProps {
  type: ContactType
  visible: boolean
}

const { TextArea } = Input

const Form: React.FC<Props> = ({ model, readOnly }) => {
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

  return (
    <div className={styles.emailForm}>
      {contactProps.filter(({ visible }) => visible).map(({ type }, i) => (
        <ContactSelect key={i} model={model} toggleCopyField={toggleCopyField} type={type} readOnly={readOnly} />
      ))}
      <div className={styles.subject}>
        <div>{Watchman.I18n().t('threesixty.question.email_type.subject')}</div>
        <Input
          value={model.result.answers.subject}
          onChange={({ target: { value } }): void => handleTestChange('subject', value)}
          disabled={readOnly}
        />
      </div>
      <div>
        <div>{Watchman.I18n().t('threesixty.question.email_type.message')}</div>
        <TextArea
          className={styles.message}
          value={model.result.answers.message}
          rows={7}
          onChange={({ target: { value } }): void => handleTestChange('message', value)}
          disabled={readOnly}
        />
      </div>
    </div>
  )
}

export default Form
