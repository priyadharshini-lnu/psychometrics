import { useEffect } from 'react'
import * as messageBus from '~/utils/messageBus'

export const useMessageBus = (channel: string, callback) => {
  const sendMessage = (channel: string, message) => {
    messageBus.sendMessage(channel, message)
  }

  const remove = (channel:string, callback) => {
    messageBus.removeListener(channel, callback)
  }

  useEffect(() => {
    messageBus.addListener(channel, callback)
    return () => {
      messageBus.removeListener(channel, callback)
    }
  }, [callback])

  return {
    sendMessage, remove,
  }
}
