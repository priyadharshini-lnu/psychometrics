import { Component } from 'react'
import PropTypes from 'prop-types'
import textEntryStyles from '~/modules/survey/components/modules/TextEntry/components/styles.less'
import FileUploadBlock from '~/modules/survey/components/FileUpload'
import { SafeHTML } from '~/components/SafeHTML'
import connect from './connect'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  successUpload = (data) => {
    const { addMediaResponse } = this.props
    addMediaResponse(data)
  }

  removeFile = () => {
    const { setSubmissionInProgress } = this.props
    setSubmissionInProgress(true)
  }

  removeFileSuccess = () => {
    const {
      model, removeMediaResponse, setSubmissionInProgress,
    } = this.props
    removeMediaResponse(model.id)
    setSubmissionInProgress(false)
  }

  renderFileUploadBlock () {
    const {
      model, mediaUrl, type, readOnly, markQuestionInProgress, removeQuestionInProgress, mediaResponse,
    } = this.props
    const preview = type === 'preview_assessment'

    return (
      <FileUploadBlock
        mediaUrl={mediaUrl}
        model={model}
        mediaResponse={mediaResponse}
        readOnly={readOnly}
        fakeUpload={preview}
        onSuccessUpload={this.successUpload}
        onBeforeRemove={this.removeFile}
        onRemoveFile={this.removeFileSuccess}
        markQuestionInProgress={markQuestionInProgress}
        removeQuestionInProgress={removeQuestionInProgress}
      />
    )
  }

  render () {
    const { model, I18n } = this.props
    return (
      <div>
        <SafeHTML
          html={I18n.tQuestion(model, 'questionText')}
          className={textEntryStyles.questionTextPreview}
          config="adminRichText"
        />
        {this.renderFileUploadBlock()}
      </div>
    )
  }
}

export default connect(Preview)
