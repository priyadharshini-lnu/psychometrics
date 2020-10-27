import React from 'react'
import { Question } from '../interfaces'
import styles from '../commonStyles.scss'
import Header from './Header'
import Form from './Form'
import { ContactType } from '../interfaces/Email'

interface Props {
  model: Question
}

const Email: React.FC<Props> = ({
  model,
  model: {
    props,
    props: {
      contactList,
      subject,
      contacts,
    },
  },
}) => {
  const changeProps = (value: string, key: string): void => model.changeProps({ [key]: value })
  const changeContacts = (type: ContactType, value: string[]): void => model.changeProps({
    contacts: {
      ...(contacts || {}),
      [type]: value,
    },
  })
  return (
    <div className={styles.container}>
      <Header {...props} changeProps={changeProps} />
      <Form
        contactList={contactList}
        subject={subject}
        changeProps={changeProps}
        changeContacts={changeContacts}
        contacts={contacts}
      />
    </div>
  )
}

export default Email
