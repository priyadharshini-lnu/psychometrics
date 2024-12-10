import React from 'react'
import { Select, Button } from 'antd'
import _ from 'lodash'
import styles from '../commonStyles.less'
import { TO_TYPE, CC_TYPE, BCC_TYPE } from '../constants'
import { ContactType } from '../interfaces/Email'

interface Props {
  contactList: string[]
  type: ContactType
  toggleCopyField: (type: 'cc' | 'bcc') => void
  onChange: (type: ContactType, value: string[]) => void
  contacts: string[]
}

const { Option } = Select

const ContactSelect: React.FC<Props> = ({
  contactList, type, toggleCopyField, onChange, contacts,
}) => (
  <div className={styles.contactSelect}>
    <div className={styles.selectLabel}>
      <div>{_.capitalize(type)}</div>
      {type === TO_TYPE && (
        <div>
          <Button
            type="link"
            className={styles.copy}
            onClick={(): void => toggleCopyField(CC_TYPE)}
          >
            {_.capitalize(CC_TYPE)}
          </Button>
          <Button
            type="link"
            className={styles.copy}
            onClick={(): void => toggleCopyField(BCC_TYPE)}
          >
            {_.capitalize(BCC_TYPE)}
          </Button>
        </div>
      )}
    </div>
    <Select
      className={styles.select}
      mode="multiple"
      value={contacts}
      onChange={(value: string[]) => onChange(type, value)}
    >
      {contactList.filter(Boolean).map((contact, i) => (
        <Option key={i} value={contact}>{contact}</Option>
      ))}
    </Select>
  </div>
)

export default ContactSelect
