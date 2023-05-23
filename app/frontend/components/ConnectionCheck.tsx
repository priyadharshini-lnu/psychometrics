/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef } from 'react'
import { message } from 'antd'
import { MessageType } from 'antd/lib/message'

const { App, I18n } = window

interface Props {
  onConnected?(): void
  onDisconnected?(): void
}

const MESSAGE_KEY = 'connectionCheck'
const { setTimeout, clearTimeout } = window

export default function ConnectionCheck (props: Props = {}) {
  const closeMessageRef = useRef<MessageType>()
  const timerRef = useRef<number>()
  const { onConnected, onDisconnected } = props

  const handleDisconnection = () => {
    onDisconnected && onDisconnected()
    closeMessageRef.current = message.warning({
      content: <b>{I18n.t('shared.internet_disconnected_message')}</b>,
      duration: 0,
      key: MESSAGE_KEY,
    })
  }

  const handleConnection = () => {
    closeMessageRef.current && closeMessageRef.current()
    onConnected && onConnected()
  }

  useEffect(() => {
    const subscription = App.cable?.subscriptions.create({ channel: 'ConnectionCheckChannel' }, {
      connected () {
        if (timerRef.current) { clearTimeout(timerRef.current) }
        handleConnection()
      },
      disconnected () {
        timerRef.current = setTimeout(handleDisconnection, 500)
      },
    })

    return () => subscription?.unsubscribe()
  }, [])

  return null
}
