import React, { useState } from 'react'
import cs from 'classnames'
import { Input, Button } from 'antd'
import _ from 'lodash'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import styles from '../ChatStyle.less'
import { Question } from '../interfaces'
import { ENTER_CODE } from '../constants'

const { TextArea } = Input
const { I18n: I18nTextTranslations } = window

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
        placeholder={I18n().t('threesixty.question.chat_type.input_placeholder')}
        onKeyUp={handleKeyUp}
        title={I18nTextTranslations.t('frontend.aria.write_message')}
      />
      <Button
        aria-label={I18nTextTranslations.t('frontend.aria.send_message')}
        onClick={createMessage}
        className={styles.sendIconContainer}
      >
        <span className={cs('fa fa-paper-plane', styles.sendIcon)} />
      </Button>
    </div>
  )
}

export default Footer
