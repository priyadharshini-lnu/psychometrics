import React from 'react'
import { Question } from '../interfaces'
import styles from '../EmailStyle.scss'
import Header from './Header'
import Form from './Form'

interface Props {
  model: Question
}

const Email: React.FC<Props> = ({ model }) => (
  <div className={styles.container}>
    <Header model={model} />
    <Form model={model} />
  </div>
)

export default Email
