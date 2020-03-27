require('green-audio-player/dist/css/green-audio-player.css')
window.GreenAudioPlayer = require('green-audio-player/dist/js/green-audio-player.js')

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
