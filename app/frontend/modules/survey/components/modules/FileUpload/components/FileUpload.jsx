import { Component } from 'react'
import PropTypes from 'prop-types'
import textEntryStyles from '~/modules/survey/components/modules/TextEntry/components/styles.less'
import TextEditor from '~/modules/survey/components/TextEditor'
import FileUploadBlock from '~/modules/survey/components/FileUpload'

export class FileUpload extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeQuestionText = (value) => {
    const { model } = this.props
    model.props.questionText = value
    model.update()
    this.forceUpdate()
  }

  render () {
    const {
      model, readOnly, markQuestionInProgress, removeQuestionInProgress,
    } = this.props
    return (
      <div className="position-relative">
        <div className={textEntryStyles.questionText}>
          <TextEditor model={model} value={model.props.questionText} onChange={this.changeQuestionText} />
        </div>
        <FileUploadBlock
          model={model}
          fakeUpload
          readOnly={readOnly}
          markQuestionInProgress={markQuestionInProgress}
          removeQuestionInProgress={removeQuestionInProgress}
        />
      </div>
    )
  }
}

export default FileUpload
