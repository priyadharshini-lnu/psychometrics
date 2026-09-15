import { SYNC_TIMEOUT_CHANNEL } from '~/constants/channelNames'

export type SyncTimeoutMessage = {
  userId: number | string | undefined
  nextTimeout: string | null | undefined
}

type Listener = (message: SyncTimeoutMessage) => void

export class CreateSyncTimeoutChannel {
  static channel: BroadcastChannel | null = null

  private static listeners: Set<Listener> = new Set()

  static setChannel () {
    if (!this.channel) {
      this.channel = new BroadcastChannel(SYNC_TIMEOUT_CHANNEL)
    }
  }

  // BroadcastChannel skips the sender, so also notify same-tab subscribers directly.
  static publish (message: SyncTimeoutMessage) {
    this.setChannel()
    this.channel?.postMessage(message)
    this.listeners.forEach(listener => listener(message))
  }

  static subscribe (listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  static reset () {
    this.listeners.clear()
    this.channel = null
  }
}
