import React, { useEffect, useRef } from 'react'
import _ from 'lodash'
import Message from './Message'
import styles from '../ChatStyle.less'
import { Question, Message as MessageInterface } from '../interfaces'
import { MINE_TYPE } from '../constants'

interface Props {
  model: Question
  messageList: MessageInterface[]
  readOnly?: boolean
}

const MessageList: React.FC<Props> = ({
  messageList, model, model: { result: { answers } }, readOnly,
}) => {
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [answers])

  // eslint-disable-next-line arrow-body-style
  const answersMessageList = (): MessageInterface[] => answers.filter(a => a.value).map(({ value, index }) => {
    return { type: MINE_TYPE, text: value, position: index }
  })

  return (
    <div ref={messagesRef} className={styles.messageList}>
      {_.sortBy(messageList, 'position').map((message, i) => (
        <Message model={model} key={i} message={message} />
      ))}
      {answersMessageList().map((message, i) => (
        <Message model={model} key={i} message={message} isAnswer readOnly={readOnly} />
      ))}
    </div>
  )
}

export default MessageList
