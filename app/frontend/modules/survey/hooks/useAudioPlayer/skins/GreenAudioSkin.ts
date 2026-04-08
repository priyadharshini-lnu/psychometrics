import GreenAudioPlayer from '@thetalententerprise/green-audio-player'
import '@thetalententerprise/green-audio-player/dist/css/green-audio-player.min.css'

import { AudioPlayerSkin } from '../interfaces'

const GreenAudioSkin: AudioPlayerSkin = {
  render (el) {
    el.querySelector('audio')?.removeAttribute('controls')
    // eslint-disable-next-line no-new
    new GreenAudioPlayer(el)
  },
}

export default GreenAudioSkin
