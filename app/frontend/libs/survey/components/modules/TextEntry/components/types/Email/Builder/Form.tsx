import React, { useState } from 'react'
import { Input } from 'antd'
import styles from '../commonStyles.scss'
import ContactSelect from './ContactSelect'
import { TO_TYPE, CC_TYPE, BCC_TYPE } from '../constants'
import { ContactType } from '../interfaces/Email'

interface Props {
  contactList: string[]
}

interface ContactProps {
  type: ContactType
  visible: boolean
}

const { TextArea } = Input

const defaultContactProps: ContactProps[] = [
  { type: TO_TYPE, visible: true },
  { type: CC_TYPE, visible: false },
  { type: BCC_TYPE, visible: false },
]

const Form: React.FC<Props> = ({ contactList }) => {
  const [contactProps, setContactProps] = useState<ContactProps[]>(defaultContactProps)

  const toggleCopyField = (type: ContactType): void => {
    setContactProps(contactProps.map(p => (p.type === type ? { ...p, visible: !p.visible } : p)))
  }

  return (
    <div className={styles.emailForm}>
      {contactProps.filter(({ visible }) => visible).map(({ type }, i) => (
        <ContactSelect key={i} contactList={contactList} toggleCopyField={toggleCopyField} type={type} />
      ))}
      <div className={styles.subject}>
        <div>Subject</div>
        <Input />
      </div>
      <div>
        <div>Your Message</div>
        <TextArea rows={7} />
      </div>
    </div>
  )
}

export default Form
