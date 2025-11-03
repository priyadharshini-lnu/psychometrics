import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  setProctoringState,
} from '~/core/proctoring'

const PROCTORING_MESSAGE = 'proctoringReady_n6EY'
const MESSAGE_TIMEOUT = 3000

export const useIsProctored = () => {
  const dispatch = useDispatch()
  const proctoringState = useSelector((state: RootState) => state.proctoring)

  const timeoutRef = useRef<NodeJS.Timeout>()
  const messageReceivedRef = useRef(false)

  useEffect(() => {
    if (proctoringState.isProctored) { return }
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'string' && event.data === PROCTORING_MESSAGE) {
        messageReceivedRef.current = true

        dispatch(setProctoringState({
          isProctored: true,
          proctoringCheckInProgress: false,
          proctoringMethod: 'message',
        }))

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }

    timeoutRef.current = setTimeout(() => {
      if (!messageReceivedRef.current) {
        dispatch(setProctoringState({
          proctoringCheckInProgress: false,
          proctoringMethod: null,
        }))
      }
    }, MESSAGE_TIMEOUT)

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [MESSAGE_TIMEOUT, proctoringState.isProctored])

  return proctoringState
}
