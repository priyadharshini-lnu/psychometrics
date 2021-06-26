import React, { useState } from 'react'
import { BuilderModel } from 'modules/survey/interfaces/questions/TextEntry'
import styles from '../ChatStyle.scss'
import Header from './Header'
import Footer from './Footer'
import MessageList from './MessageList'

interface Props {
  model: BuilderModel
}

const Chat: React.FC<Props> = ({
  model,
  model: {
    props,
    props: {
      messageList,
    },
  },
}) => {
  const [messageListState, setMessageListState] = useState<BuilderModel['props']['messageList']>(messageList)

  const changeProps = (value: string, key: string): void => model.changeProps({ [key]: value })

  const updateMessageList = (value: BuilderModel['props']['messageList']): void => {
    model.changeProps({ messageList: value })
    setMessageListState(value)
  }

  return (
    <div className={styles.container}>
      <Header {...props} changeProps={changeProps} />
      <MessageList
        {...props}
        updateMessageList={updateMessageList}
        setMessageListState={setMessageListState}
        messageList={messageListState}
      />
      <Footer {...props} updateMessageList={updateMessageList} />
    </div>
  )
}

export default Chat
