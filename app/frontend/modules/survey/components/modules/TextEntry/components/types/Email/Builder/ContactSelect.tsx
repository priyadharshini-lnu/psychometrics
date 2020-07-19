import React from 'react'
import { Select } from 'antd'
import _ from 'lodash'
import styles from '../commonStyles.scss'
import { TO_TYPE, CC_TYPE, BCC_TYPE } from '../constants'
import { ContactType } from '../interfaces/Email'

interface Props {
  contactList: string[]
  type: ContactType
  toggleCopyField: (type: 'cc' | 'bcc') => void
}

const { Option } = Select

const ContactSelect: React.FC<Props> = ({ contactList, type, toggleCopyField }) => (
  <div className={styles.contactSelect}>
    <div className={styles.selectLabel}>
      <div>{_.capitalize(type)}</div>
      {type === TO_TYPE && (
        <div>
          <span className={styles.copy} onClick={(): void => toggleCopyField(CC_TYPE)}>{_.capitalize(CC_TYPE)}</span>
          <span className={styles.copy} onClick={(): void => toggleCopyField(BCC_TYPE)}>{_.capitalize(BCC_TYPE)}</span>
        </div>
      )}
    </div>
    <Select className={styles.select} mode="multiple">
      {contactList.filter(Boolean).map((contact, i) => (
        <Option key={i} value={contact}>{contact}</Option>
      ))}
    </Select>
  </div>
)

export default ContactSelect
