import React from 'react'
import _ from 'lodash'
import Message from './Message'
import styles from '../ChatStyle.scss'
import { Message as MessageInterface } from '../interfaces'

interface Props {
  messageList: MessageInterface[]
  setMessageListState: (value: MessageInterface[]) => void
  updateMessageList: (value: MessageInterface[]) => void
}

const MessageList: React.FC<Props> = ({
  messageList, setMessageListState, updateMessageList,
}) => {
  const moveMessage = (dragPosition: number, hoverPosition: number): void => {
    const value = messageList.map((message) => {
      const { position } = message
      if (position === dragPosition) return { ...message, position: hoverPosition }

      if (dragPosition < hoverPosition && position > dragPosition && position <= hoverPosition) {
        return { ...message, position: position - 1 }
      }

      if (dragPosition > hoverPosition && position >= hoverPosition && position < dragPosition) {
        return { ...message, position: position + 1 }
      }

      return message
    })
    setMessageListState(value)
  }
  return (
    <div className={styles.messageList}>
      {_.sortBy(messageList, 'position').map((message: MessageInterface, i: number) => (
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        <Message
          key={i}
          message={message}
          moveMessage={moveMessage}
          messageList={messageList}
          updateMessageList={updateMessageList}
        />
      ))}
    </div>
  )
}

export default MessageList
