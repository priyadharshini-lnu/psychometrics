import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { SafeHTML } from 'components/SafeHTML'

import { setDictationActiveOnQuestion } from 'modules/survey/core/preview/FlowProcessor/actions'
import {
  getI18n,
  getAwsSpeechTextPresignedUrl,
  getQuestionWithActiveDictation,
} from 'modules/survey/core/preview/FlowProcessor/selectors'

import styles from './components/styles.scss'
import Previews from './Previews'


const connector = connect(
  ({ preview }) => ({
    I18n: getI18n(preview),
    awsSpeechTextPresignedUrl: getAwsSpeechTextPresignedUrl(preview),
    activeDictationOnQuestion: getQuestionWithActiveDictation(preview),
  }),
  { setDictationActiveOnQuestion },
)

class PreviewComponent extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  renderAnswersType () {
    const {
      readOnly, model, awsSpeechTextPresignedUrl, activeDictationOnQuestion, setDictationActiveOnQuestion,
    } = this.props
    const { type } = model.props
    const View = Previews[type]

    return (
      <View
        model={model}
        readOnly={readOnly}
        awsSpeechTextPresignedUrl={awsSpeechTextPresignedUrl}
        activeDictationOnQuestion={activeDictationOnQuestion}
        setDictationActiveOnQuestion={setDictationActiveOnQuestion}
      />
    )
  }

  render () {
    const { model, I18n } = this.props

    return (
      <div>
        <SafeHTML
          className={styles.questionTextPreview}
          html={I18n.tQuestion(model, 'questionText')}
          config="adminRichText"
        />
        {this.renderAnswersType()}
      </div>
    )
  }
}

export const Preview = connector(PreviewComponent)
