import React from 'react'
import PropTypes from 'prop-types'
import textEntryStyles from 'components/modules/TextEntry/components/TextEntry.scss'
import TextEditor from 'components/TextEditor'
import VideoRecorder from 'components/VideoRecorder'

export class VideoResponse extends React.Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeText = (value) => {
    const { model } = this.props
    model.changeProps({ questionText: value })
    this.forceUpdate()
  }

  renderVideoRecorder () {
    const { model, markQuestionInProgress, removeQuestionInProgress } = this.props

    return (
      <div className="col-md-8">
        <VideoRecorder
          key={model.id}
          maxDuration={model.props.duration || 10}
          markQuestionInProgress={markQuestionInProgress}
          removeQuestionInProgress={removeQuestionInProgress}
          fitInFrame={model.props.fitInFrame}
          trackerOptions={model.props.trackerOptions}
        />
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
