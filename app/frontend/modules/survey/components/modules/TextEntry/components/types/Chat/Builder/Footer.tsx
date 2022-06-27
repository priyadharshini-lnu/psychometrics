import React, { useState } from 'react'
import { Select, Input } from 'antd'
import cs from 'classnames'
import _ from 'lodash'
import styles from '../ChatStyle.less'
import { Message } from '../interfaces'
import { MessageType } from '../interfaces/Message'
import { ENTER_CODE, MINE_TYPE } from '../constants'

const { Option } = Select
const { TextArea } = Input

interface Props {
  messageList: Message[]
  updateMessageList: (value: Message[]) => void
}

interface MessageForm {
  text: string
  type: MessageType
}

const Footer: React.FC<Props> = ({ messageList, updateMessageList }) => {
  const [messageForm, setMessageForm] = useState<MessageForm>({ text: '', type: MINE_TYPE })

  const createMessage = (): void => {
    const text = messageForm.text.trim()
    if (!text) return

    const maxPosition = _.maxBy(messageList, 'position')?.position
    if (maxPosition) {
      updateMessageList([...messageList, { ...messageForm, text, position: maxPosition + 1 }])
    }
    setMessageForm({ ...messageForm, text: '' })
  }

  const handleKeyUp = ({ shiftKey, keyCode }): void => {
    if (!shiftKey && keyCode === ENTER_CODE) createMessage()
  }

  return (
    <div className={styles.footer}>
      <TextArea
        autoSize
        value={messageForm.text}
        onChange={({ target: { value } }): void => setMessageForm({ ...messageForm, text: value })}
        className={styles.chatInput}
        placeholder="Write your Message..."
        onKeyUp={handleKeyUp}
      />
      <Select
        defaultValue={messageForm.type}
        onChange={(e: MessageType): void => setMessageForm({ ...messageForm, type: e })}
      >
        <Option value="mine">Mine</Option>
        <Option value="their">Their</Option>
      </Select>
      <div onClick={createMessage} className={styles.sendIconContainer}>
        <span className={cs('fa fa-paper-plane', styles.sendIcon)} />
      </div>
    </div>
  )
}

export default Footer
