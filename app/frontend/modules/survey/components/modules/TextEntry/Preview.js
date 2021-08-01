import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { SafeHTML } from 'components/SafeHTML'

import {
  setDictationActiveOnQuestion,
  fetchAwsSpeechTextPresignedUrl,
} from 'modules/survey/core/preview/FlowProcessor/actions'
import {
  getI18n,
  getQuestionWithActiveDictation,
} from 'modules/survey/core/preview/FlowProcessor/selectors'

import Previews from './Previews'

const connector = connect(
  ({ preview }) => ({
    I18n: getI18n(preview),
    activeDictationOnQuestion: getQuestionWithActiveDictation(preview),
  }),
  {
    setDictationActiveOnQuestion,
    fetchAwsSpeechTextPresignedUrl,
  },
)

class PreviewComponent extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  renderAnswersType () {
    const {
      readOnly,
      model,
      model: {
        props: { type },
      },
      activeDictationOnQuestion,
      setDictationActiveOnQuestion,
      fetchAwsSpeechTextPresignedUrl,
    } = this.props
    const View = Previews[type]

    return (
      <View
        model={model}
        readOnly={readOnly}
        activeDictationOnQuestion={activeDictationOnQuestion}
        setDictationActiveOnQuestion={setDictationActiveOnQuestion}
        fetchAwsSpeechTextPresignedUrl={fetchAwsSpeechTextPresignedUrl}
      />
    )
  }

  render () {
    const { model, I18n } = this.props

    return (
      <div>
        <SafeHTML
          className="mb-4"
          html={I18n.tQuestion(model, 'questionText')}
          config="adminRichText"
        />
        {this.renderAnswersType()}
      </div>
    )
  }
}

export const Preview = connector(PreviewComponent)
