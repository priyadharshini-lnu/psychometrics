import React from 'react'
import { Question } from '../interfaces'
import styles from '../EmailStyle.scss'
import Header from './Header'
import Form from './Form'

interface Props {
  model: Question
}

const Email: React.FC<Props> = ({
  model,
  model: {
    props,
    props: {
      contactList,
    },
  },
}) => {
  const changeProps = (value: string, key: string): void => model.changeProps({ [key]: value })

  return (
    <div className={styles.container}>
      <Header {...props} changeProps={changeProps} />
      <Form contactList={contactList} />
    </div>
  )
}

export default Email
