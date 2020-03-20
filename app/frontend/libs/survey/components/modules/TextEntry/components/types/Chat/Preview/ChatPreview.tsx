import React from 'react'
import styles from '../ChatStyle.scss'
import Header from './Header'
import Footer from './Footer'
import MessageList from './MessageList'
import { Question } from '../interfaces'

interface Props {
  model: Question
}

const Chat: React.FC<Props> = ({ model, model: { props } }) => (
  <div className={styles.container}>
    <Header model={model} />
    <MessageList {...props} model={model} />
    <Footer {...props} model={model} />
  </div>
)

export default Chat
