import React, { useEffect, useState } from 'react'
import { Input, Form } from 'antd'
import _ from 'lodash'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import { QuestionError } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import styles from '../commonStyles.less'
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
  errors: QuestionError[]
}

export interface ContactProps {
  type: ContactType
  visible: boolean
}

const fieldsInOrder = ['to', 'subject', 'message']

const { TextArea } = Input

const EmailForm: React.FC<Props> = ({ model, readOnly, errors }) => {
  const { answers: { message } } = model.result
  const { maxLength, contacts } = model.props
  const defaultContactProps: ContactProps[] = [
    { type: TO_TYPE, visible: true },
    { type: CC_TYPE, visible: !_.isEmpty(model.result.answers[CC_TYPE]) },
    { type: BCC_TYPE, visible: !_.isEmpty(model.result.answers[BCC_TYPE]) },
  ]

  const [contactProps, setContactProps] = useState<ContactProps[]>(defaultContactProps)

  useEffect(() => {
    // Without timeout, the answers get sent to the server before next button is clicked.
    // Reason needs to be investigated.
    const timeout = setTimeout(() => {
      if (_.isUndefined(model.result.answers.subject)) {
        handleTestChange('subject', I18n().tQuestion(model, 'subject'))
      }
      const copyFields: ContactType[] = []

      defaultContactProps.forEach(({ type }) => {
        if (_.isUndefined(model.result.answers[type])) {
          const defaultContacts = _.get(contacts, type)
          if (!_.isEmpty(defaultContacts)) {
            model.result.answer({ ...model.result.answers, [type]: defaultContacts })
            copyFields.push(type)
          }
        }
      })
      showCopyFields(copyFields)
    }, 200)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (errors && errors.length) {
      const firstErrorField = getFirstErrorField(fieldsInOrder, errors)
      const errorFieldId = `email-${firstErrorField}-${model.id}`
      document.getElementById(errorFieldId)?.focus()
    }
  }, [errors])

  const toggleCopyField = (type: ContactType): void => {
    setContactProps(contactProps.map(p => (p.type === type ? { ...p, visible: !p.visible } : p)))
  }

  const showCopyFields = (types: ContactType[]): void => {
    setContactProps(contactProps.map(p => (types.includes(p.type) ? { ...p, visible: true } : p)))
  }

  const handleTestChange = (key: string, value: string): void => {
    model.result.answer({ ...model.result.answers, [key]: value })
  }

  const validationProps = (field: string): { validateStatus: 'error', help: string } | {} => {
    const error = _.find(errors, { field })
    if (error && error.message) {
      return { validateStatus: 'error', help: error.message }
    }

    return {}
  }

  const remainingLength = (maxLength || 0) - (message?.length || 0)

  return (
    <div className={styles.emailForm}>
      {contactProps.filter(({ visible }) => visible).map(({ type }, i) => (
        <ContactSelect
          error={validationProps(type)}
          key={i}
          model={model}
          toggleCopyField={toggleCopyField}
          type={type}
          readOnly={readOnly}
          contactProps={contactProps}
        />
      ))}
      <div className={styles.subject}>
        <label htmlFor={`email-subject-${model.id}`}>{I18n().t('threesixty.question.email_type.subject')}</label>
        <Form.Item {...validationProps('subject')}>
          <Input
            defaultValue={model.result.answers.subject}
            onChange={({ target: { value } }): void => handleTestChange('subject', value)}
            disabled={readOnly}
            id={`email-subject-${model.id}`}
          />
        </Form.Item>
      </div>
      <div>
        <label htmlFor={`email-message-${model.id}`}>{I18n().t('threesixty.question.email_type.message')}</label>
        <Form.Item {...validationProps('message')}>
          <TextArea
            className={styles.message}
            defaultValue={message}
            rows={7}
            onChange={({ target: { value } }): void => handleTestChange('message', value)}
            disabled={readOnly}
            maxLength={maxLength}
            id={`email-message-${model.id}`}
          />
        </Form.Item>
        {maxLength
         && (
         <small aria-live="polite">
           {I18n().t('threesixty.question.email_type.max_length_warning', { x: remainingLength })}
         </small>
         )
         }
      </div>
    </div>
  )
}

const getFirstErrorField = (fieldsInOrder: Array<string>, errors: QuestionError[]):string => {
  const fieldsWithError = errors.map(error => error.field)
  for (let fieldIndex = 0; fieldIndex < fieldsInOrder.length;) {
    if (fieldsWithError.includes(fieldsInOrder[fieldIndex])) {
      return fieldsInOrder[fieldIndex]
    }
    fieldIndex += 1
  }
  return ''
}

export default EmailForm
