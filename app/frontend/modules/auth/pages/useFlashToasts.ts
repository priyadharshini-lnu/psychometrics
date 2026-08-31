import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useApp } from '@thetalententerprise/glint'
import { clearFlashMessage } from '../core/flash'
import { RootState } from '../core/reducers'

type FlashItem = RootState['flash'][number]

type Method = 'error' | 'success' | 'info' | 'warning'

const METHODS: Record<string, Method | undefined> = {
  alert: 'error',
  error: 'error',
  warning: 'warning',
  success: 'success',
  notice: 'info',
}

export const useFlashToasts = (flash: FlashItem[] = [], enabled = true) => {
  const { message } = useApp()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!enabled) return
    const items = (flash || []).filter(Boolean)
    if (items.length === 0) return

    items.forEach((item) => {
      message[METHODS[item.type] || 'info'](item.value)
    })
    // Consuming it stops the same boot flash toasting again on every SPA move between auth routes.
    dispatch(clearFlashMessage())
  }, [flash, enabled, message, dispatch])
}

export default useFlashToasts
