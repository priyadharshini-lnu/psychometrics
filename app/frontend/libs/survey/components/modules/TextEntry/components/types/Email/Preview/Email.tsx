import React from 'react'
import { Question } from '../interfaces'
import styles from '../EmailStyle.scss'
import Header from './Header'
import Form from './Form'

interface Props {
  model: Question
  readOnly?: boolean
}

const Email: React.FC<Props> = ({ model, readOnly }) => (
  <div className={styles.container}>
    <Header model={model} />
    <Form model={model} readOnly={readOnly} />
  </div>
)

export default Email
