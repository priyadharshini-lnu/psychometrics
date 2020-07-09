import React from 'react'
import { I18n } from 'store/StoreWatchman'
import { Result } from 'antd'
import TweenOne from 'rc-tween-one'
import { Question } from '../interfaces'
import { ViewEnum } from '../constants'

interface Props {
  model: Question
  readOnly?: boolean
  setView: (view: ViewEnum) => void
}

const SendAnimation: React.FC<Props> = ({ setView }) => (
  <TweenOne
    animation={{ opacity: 0, duration: 1000, onComplete: () => setView(ViewEnum.View) }}
  >
    <Result status="success" title={I18n().t('threesixty.question.email_type.successful_message')} />
  </TweenOne>
)

export default SendAnimation
