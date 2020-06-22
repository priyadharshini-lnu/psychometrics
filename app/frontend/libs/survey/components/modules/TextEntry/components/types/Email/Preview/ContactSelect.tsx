import React from 'react'
import { Select, Form } from 'antd'
import { I18n } from 'store/StoreWatchman'
import styles from '../commonStyles.scss'
import { TO_TYPE, CC_TYPE, BCC_TYPE } from '../constants'
import { ContactType } from '../interfaces/Email'
import { Question } from '../interfaces'

interface Props {
  model: Question
  type: ContactType
  toggleCopyField: (type: 'cc' | 'bcc') => void
  readOnly?: boolean
  error: { validateStatus: 'error', help: string } | {}
}

const { Option } = Select

const ContactSelect: React.FC<Props> = ({
  model, model: { props: { contactList } }, type, toggleCopyField, readOnly, error,
}) => {
  const handleChange = (value: ContactType[]): void => {
    model.result.answer({ ...model.result.answers, [type]: value })
  }

  return (
    <div className={styles.contactSelect}>
      <div className={styles.selectLabel}>
        <div>{I18n().t(`threesixty.question.email_type.${type}`)}</div>
        {type === TO_TYPE && (
        <div>
          <a className={styles.copy} onClick={(): void => toggleCopyField(CC_TYPE)}>
            {I18n().t(`threesixty.question.email_type.${CC_TYPE}`)}
          </a>
          <a className={styles.copy} onClick={(): void => toggleCopyField(BCC_TYPE)}>
            {I18n().t(`threesixty.question.email_type.${BCC_TYPE}`)}
          </a>
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
