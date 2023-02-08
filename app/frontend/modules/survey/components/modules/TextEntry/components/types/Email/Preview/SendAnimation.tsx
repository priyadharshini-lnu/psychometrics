import React from 'react'
import { Result } from 'antd'
import TweenOne from 'rc-tween-one'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import { ViewEnum } from '../constants'

interface Props {
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
