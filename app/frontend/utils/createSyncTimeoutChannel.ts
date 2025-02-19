import { SYNC_TIMEOUT_CHANNEL } from '~/constants/channelNames'

export class CreateSyncTimeoutChannel {
  static channel:BroadcastChannel |null = null

  static setChannel () {
    if (!this.channel) {
      this.channel = new BroadcastChannel(SYNC_TIMEOUT_CHANNEL)
    }
  }
}
