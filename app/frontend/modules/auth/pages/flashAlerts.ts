import type { AuthAlertItem } from '@thetalententerprise/glint'
import { RootState } from '../core/reducers'

type FlashItem = RootState['flash'][number]

const mapType = (type: string): AuthAlertItem['type'] => {
  switch (type) {
    case 'alert':
    case 'error':
      return 'error'
    case 'notice':
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
  .map(f => ({ type: mapType(f.type), message: f.value }))
