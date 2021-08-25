import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import mediumZoom from 'medium-zoom'
import Previews from 'components/modules/Previews'
import QuestionSerializer from 'models/QuestionSerializer'
import { initAudioPlayer } from 'modules/survey/hooks/useAudioPlayer'
import { isEmailTextEntryQuestion } from 'modules/survey/utils/question'
import { SafeHTML } from 'components/SafeHTML'
import styles from './Question.scss'

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    page: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,
    randomseed: PropTypes.string,
  }

  componentDidMount () {
    initAudioPlayer(this.question)
    this.initImageZoom()
  }

  componentWillUnmount () {
    this.zoom?.detach()
  }

  update = () => {
    this.forceUpdate()
  }

  addLtrStyleIfNeed = phrase => (phrase.match(/[A-Za-z]+(?:\|;|\.|!|\?|:)/) !== null ? { direction: 'ltr' } : {})

  initImageZoom () {
    // eslint-disable-next-line react/no-find-dom-node
    const node = ReactDOM.findDOMNode(this.question)
    const images = node.querySelectorAll('img.zoom-image')
    this.zoom = mediumZoom(images)
  }

  renderPreview () {
    const { model, result, randomseed } = this.props
    const View = Previews[`${model.type}Preview`] || Previews.MultipleChoice
    return (
      <View
        {...this.props}
        model={QuestionSerializer.wrap(model, result.answers, result.not_applicable, randomseed)}
        preview
      />
    )
  }

  renderError () {
    const { errors } = this.props
    return (
      errors.map((err, i) => (
        <div key={i} className={styles.error} style={this.addLtrStyleIfNeed(err.message || '')}>
          <SafeHTML as="div" html={err.message} config="error" />
        </div>
      ))
    )
  }

  render () {
    const { model, moduleConfig, hideHiddenQuestions } = this.props
    const hidden = hideHiddenQuestions && moduleConfig.hidden
    const { allowContentCopy } = model.props

    const stylesProps = {
      display: hidden ? 'none' : 'flex',
      overflow: 'auto',
    }

    return (
      <div
        style={stylesProps}
        ref={(ref) => { this.question = ref }}
        name={`question_${model.id}`}
        className={`${styles.question} highlight-container`}
        data-allow-content-copy={allowContentCopy ? 1 : 0}
      >
        <div className={styles.content}>
          {!model.valid && !isEmailTextEntryQuestion(model) && this.renderError()}
          <div className={styles.contentOuter}>
            {this.renderPreview()}
          </div>
        </div>
      </div>
    )
  }
}

export default Question
