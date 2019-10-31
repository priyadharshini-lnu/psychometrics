import React from 'react'
import PropTypes from 'prop-types'
import textEntryStyles from 'components/modules/TextEntry/components/TextEntry.scss'
import TextEditor from 'components/TextEditor'
import VideoRecorder from 'components/VideoRecorder'
import MultiLine from './MultiLine'

export class VideoResponse extends React.Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeText = (value) => {
    const { model } = this.props
    model.changeProps({ questionText: value })
    this.forceUpdate()
  }

  renderAnswersType () {
    const { model } = this.props
    return <MultiLine model={model} />
  }

  renderVideoRecorder () {
    const { model } = this.props

    return (
      <div className="col-md-8">
        <VideoRecorder key={model.id} maxDuration={model.props.duration || 10} />
      </div>
    )
  }

  render () {
    const { model } = this.props
    return (
      <div style={{ position: 'relative' }}>
        <div className={textEntryStyles.questionText}>
          <TextEditor model={model} value={model.props.questionText} onChange={this.changeText} />
        </div>
        {this.renderVideoRecorder()}
      </div>
    )
  }
}

export default VideoResponse
