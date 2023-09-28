/* eslint-disable react/no-danger */
import { Component } from 'react'
import videojs from 'videojs'

export class VideoPlayer extends Component {
  static propTypes = {
  }

  componentDidMount () {
    const { mediaResponse } = this.props

    if (mediaResponse) {
      this.initPlayer()
    }
  }

  initPlayer () {
    const { mediaResponse } = this.props

    const options = {
      sources: [{
        // eslint-disable-next-line max-len
        src: mediaResponse ? mediaResponse.url : undefined,
        type: 'video/mp4',
      }],
      preload: 'auto',
      controls: true,
      fluid: true,
      controlBar: {
        fullscreenToggle: false,
        volumePanel: false,
      },
    }

    this.player = videojs(this.video, options)
  }

  render () {
    return (
      <div className="col">
        <video ref={(ref) => { this.video = ref }} className="video-js vjs-default-skin vjs-4-3" />
      </div>
    )
  }
}

export default VideoPlayer
