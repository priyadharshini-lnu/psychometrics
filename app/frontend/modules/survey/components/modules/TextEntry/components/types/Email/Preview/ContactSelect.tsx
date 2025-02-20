import React from 'react'
import { Select, Form, Button } from 'antd'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import styles from '../commonStyles.less'
import { TO_TYPE, CC_TYPE, BCC_TYPE } from '../constants'
import { ContactType } from '../interfaces/Email'
import { Question } from '../interfaces'
import { ContactProps } from './Form'

interface Props {
  model: Question
  type: ContactType
  toggleCopyField: (type: 'cc' | 'bcc') => void
  readOnly?: boolean
  error: { validateStatus: 'error', help: string } | {}
  contactProps: ContactProps[]
}

const { Option } = Select

const ContactSelect: React.FC<Props> = ({
  model, model: { props: { contactList } }, type, toggleCopyField, readOnly, error, contactProps,
}) => {
  const handleChange = (value: ContactType[]): void => {
    model.result.answer({ ...model.result.answers, [type]: value })
  }

  const ccVisible = contactProps?.find(contactProp => contactProp.type === CC_TYPE)?.visible
  const bccVisible = contactProps?.find(contactProp => contactProp.type === BCC_TYPE)?.visible

  return (
    <div className={styles.contactSelect}>
      <div className={styles.selectLabel}>
        <label htmlFor={`email-${type}-${model.id}`}>{I18n().t(`threesixty.question.email_type.${type}`)}</label>
        {type === TO_TYPE && (
          <div>
            <Button aria-expanded={ccVisible} size="small" type="link" onClick={(): void => toggleCopyField(CC_TYPE)}>
              {I18n().t(`threesixty.question.email_type.${CC_TYPE}`)}
            </Button>
            <Button aria-expanded={bccVisible} size="small" type="link" onClick={(): void => toggleCopyField(BCC_TYPE)}>
              {I18n().t(`threesixty.question.email_type.${BCC_TYPE}`)}
            </Button>
          </div>
        )}
      </div>
      <Form.Item {...error}>
        <Select
          className={styles.select}
          mode="multiple"
          value={model.result.answers[type]}
          onChange={handleChange}
          disabled={readOnly}
          id={`email-${type}-${model.id}`}
        >
          {contactList?.filter(Boolean).map((contact, i) => (
            <Option key={i} value={contact}>{I18n().tQuestion(model, `contact${i}`, { index: i })}</Option>
          ))}
        </Select>
      </Form.Item>
    </div>
  )
}

export default ContactSelect
