import React from 'react'
import { BuilderModel } from '~/modules/survey/interfaces/questions/TextEntry'
import styles from '../commonStyles.less'
import Header from './Header'
import Form from './Form'
import { ContactType } from '../interfaces/Email'

interface Props {
  model: BuilderModel
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
