import React from 'react'
import { Select } from 'antd'
import Watchman from 'store/StoreWatchman'
import styles from '../EmailStyle.scss'
import { TO_TYPE, CC_TYPE, BCC_TYPE } from '../constants'
import { ContactType } from '../interfaces/Email'
import { Question } from '../interfaces'

interface Props {
  model: Question
  type: ContactType
  toggleCopyField: (type: 'cc' | 'bcc') => void
  readOnly?: boolean
}

const { Option } = Select

const ContactSelect: React.FC<Props> = ({
  model, model: { props: { contactList } }, type, toggleCopyField, readOnly,
}) => {
  const handleChange = (value: ContactType[]): void => {
    model.result.answer({ ...model.result.answers, [type]: value })
  }

  return (
    <div className={styles.contactSelect}>
      <div className={styles.selectLabel}>
        <div>{Watchman.I18n().t(`threesixty.question.email_type.${type}`)}</div>
        {type === TO_TYPE && (
        <div>
          <span className={styles.copy} onClick={(): void => toggleCopyField(CC_TYPE)}>
            {Watchman.I18n().t(`threesixty.question.email_type.${CC_TYPE}`)}
          </span>
          <span className={styles.copy} onClick={(): void => toggleCopyField(BCC_TYPE)}>
            {Watchman.I18n().t(`threesixty.question.email_type.${BCC_TYPE}`)}
          </span>
        </div>
        )}
      </div>
      <Select
        className={styles.select}
        mode="multiple"
        value={model.result.answers[type]}
        onChange={handleChange}
        disabled={readOnly}
      >
        {contactList?.filter(Boolean).map((contact, i) => (
          <Option key={i} value={contact}>{Watchman.I18n().tQuestion(model, `contact${i}`, { index: i })}</Option>
        ))}
      </Select>
    </div>
  )
}

export default ContactSelect
