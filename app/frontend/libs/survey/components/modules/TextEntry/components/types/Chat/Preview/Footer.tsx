import React, { useState } from 'react'
import cs from 'classnames'
import Watchman from 'store/StoreWatchman'
import { Input } from 'antd'
import _ from 'lodash'
import styles from '../ChatStyle.scss'
import { Question } from '../interfaces'
import { ENTER_CODE } from '../constants'

const { TextArea } = Input

interface Props {
  model: Question
  choices: number
  readOnly?: boolean
}

const Footer: React.FC<Props> = ({ model, choices, readOnly }) => {
  const [text, setText] = useState<string>('')

  const createMessage = (): void => {
    if (!text.trim() || areChoicesOver()) return

    const answers = model.result.answers.filter(a => a.value)
    const maxIndex: number = _.maxBy(answers, 'index')?.index || 0

    model.result.answer([...answers, { index: maxIndex + 1, value: text.trim() }])
    setText('')
  }

  const handleKeyUp = ({ shiftKey, keyCode }): void => {
    if (!shiftKey && keyCode === ENTER_CODE) createMessage()
  }

  const areChoicesOver = (): boolean => model.result.answers.filter(a => a.value).length >= choices

  return (
    <div className={styles.footer}>
      <TextArea
        autoSize
        value={text}
        disabled={readOnly || areChoicesOver()}
        onChange={({ target: { value } }): void => setText(value)}
        className={styles.chatInput}
        placeholder={Watchman.I18n().t('threesixty.question.chat_type.input_placeholder')}
        onKeyUp={handleKeyUp}
      />
      <div onClick={createMessage} className={styles.sendIconContainer}>
        <span className={cs('fa fa-paper-plane', styles.sendIcon)} />
      </div>
    </div>
  )
}

export default Footer
