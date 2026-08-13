import type { AuthAlertItem } from '@thetalententerprise/glint'
import { RootState } from '../core/reducers'

type FlashItem = RootState['flash'][number]

const mapType = (type: string): AuthAlertItem['type'] => {
  switch (type) {
    case 'alert':
    case 'error':
      return 'error'
    // Rails' `notice` is neutral information, not an outcome — same mapping FormHelper#flash_messages uses.
    case 'notice':
      return 'info'
    case 'success':
      return 'success'
    case 'warning':
      return 'warning'
    default:
      return 'info'
  }
}

export const flashAlerts = (flash: FlashItem[] = []): AuthAlertItem[] => (flash || [])
  .filter(Boolean)
  .map(f => ({ type: mapType(f.type), title: f.value }))
