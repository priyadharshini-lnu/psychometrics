import { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types'
import mediumZoom from 'medium-zoom'
import cs from 'classnames'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import { initAudioPlayer } from '~/modules/survey/hooks/useAudioPlayer'
import { isEmailTextEntryQuestion } from '~/modules/survey/utils/question'
import Previews from '~/modules/survey/components/modules/Previews'
import { SafeHTML } from '~/components/SafeHTML'
import styles from './Question.less'
import { addListener, removeListener, sendMessage } from '~/utils/messageBus'

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    page: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,
    randomseed: PropTypes.string,
    defaultLanguage: PropTypes.string,
    showEnhanceWithAI: PropTypes.bool,
  }

  state = {
    selected: false,
  }

  componentDidMount () {
    initAudioPlayer(this.question)
    this.initImageZoom()
    addListener('show_questions', this.onShowQuestions)
  }

  componentWillUnmount () {
    this.zoom?.detach()
    removeListener('show_questions', this.onShowQuestions)
  }

  onShowQuestions = () => {
    this.setState({ selected: false })
  }

  update = () => {
    this.forceUpdate()
  }

  addLtrStyleIfNeed = phrase => (phrase.match(/[A-Za-z]+(?:\|;|\.|!|\?|:)/) !== null ? { direction: 'ltr' } : {})

  initImageZoom () {
    // eslint-disable-next-line react/no-find-dom-node
    const node = findDOMNode(this.question)
    const images = node.querySelectorAll('img.zoom-image')
    this.zoom = mediumZoom(images)
  }

  renderPreview () {
    const {
      model, result, randomseed, showEnhanceWithAI, dispatch,
    } = this.props
    const View = Previews[`${model.type}Preview`] || Previews.MultipleChoice
    const wrapped = QuestionSerializer.wrap(model, result.answers, result.not_applicable, randomseed)
    wrapped.result.setDispatch(dispatch)
    return (
      <View
        {...this.props}
        model={wrapped}
        preview
        showEnhanceWithAI={showEnhanceWithAI}
      />
    )
  }

  renderError () {
    const { errors, model } = this.props
    return (
      <div id={`error-for-question-${model.id}`}>
        {
        errors.map((err, i) => (
          <div
            key={i}
            className={styles.error}
            style={this.addLtrStyleIfNeed(err.message || '')}
          >
            <SafeHTML as="div" html={err.message} config="error" />
          </div>
        ))
      }
      </div>
    )
  }

  onClick = () => {
    const { linkedQuestions, isAssessor } = this.props

    if (isAssessor && !linkedQuestions) {
      sendMessage('show_questions', [])
    }

    if (!linkedQuestions) { return }

    sendMessage('show_questions', linkedQuestions)
    this.setState({ selected: true })
  }

  render () {
    const {
      model, moduleConfig, hideHiddenQuestions, linkedQuestions,
    } = this.props

    const { selected } = this.state
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
        className={cs(
          styles.question, 'highlight-container',
          { [styles.selectable]: linkedQuestions, [styles.frame]: selected },
        )}
        data-allow-content-copy={allowContentCopy ? 1 : 0}
        onClick={this.onClick}
      >
        <div className={`${styles.content}`}>
          <div className={cs(styles.contentOuterBase,
            model.type === 'VideoResponse' ? styles.contentOuterVideoResponse : styles.contentOuter)}
          >
            {!model.valid && !isEmailTextEntryQuestion(model) && this.renderError()}
            <div className={styles.previewContainer}>
              {this.renderPreview()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Question
