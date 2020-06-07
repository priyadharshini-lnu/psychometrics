import GreenAudioPlayer from 'green-audio-player'
import 'green-audio-player/dist/css/green-audio-player.css'

import { AudioPlayerSkin } from '../interfaces'

const GreenAudioSkin: AudioPlayerSkin = {
  render (el) {
    el.querySelector('audio')?.removeAttribute('controls')
    // eslint-disable-next-line no-new
    new GreenAudioPlayer(el)
  },
}

export default GreenAudioSkin
