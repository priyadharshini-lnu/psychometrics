import videojs from 'videojs'

window.videojs = videojs

require('video.js/dist/video-js.css')

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
