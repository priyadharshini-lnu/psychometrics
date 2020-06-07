import videojs from 'videojs'
import 'videojs-record/dist/videojs.record'

const opts = {
  plugins: {
    record: {
      pip: false,
      audio: false,
      video: true,
      debug: false,
    },
  },
}

const InitVideo = {
  run: element => videojs(element, opts),
}

export default InitVideo
