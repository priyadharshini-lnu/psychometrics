import React from 'react'
import styles from '../ChatStyle.scss'
import Header from './Header'
import Footer from './Footer'
import MessageList from './MessageList'
import { Question } from '../interfaces'

interface Props {
  model: Question
  readOnly?: boolean
}

const Chat: React.FC<Props> = ({ model, model: { props }, readOnly }) => (
  <div className={styles.container}>
    <Header model={model} />
    <MessageList {...props} model={model} readOnly={readOnly} />
    <Footer {...props} model={model} readOnly={readOnly} />
  </div>
)

export default Chat
