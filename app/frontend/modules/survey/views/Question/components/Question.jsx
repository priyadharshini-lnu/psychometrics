import { Component } from 'react'
import PropTypes from 'prop-types'
import Confirmation from '~/modules/survey/components/Confirmation'
import styles from './Question.less'
import Footer from './QuestionFooter'
import Header from './QuestionHeader'
import QuestionInfoBar from './QuestionInfoBar'
import QuestionRenderer from './QuestionRenderer'
import Buttons from './Buttons'
import buttons from './Buttons.less'

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  state = {
    showDeleteConfirmation: false,
  }

  onCancelConfirm = () => {
    this.setState({ showDeleteConfirmation: false })
  }

  remove = () => {
    const {
      block, model, removeQuestion,
    } = this.props
    this.setState({ showDeleteConfirmation: false })
    removeQuestion(block, model)
  }

  update = () => {
    const { model, selectedModel } = this.props
    if (selectedModel === model) {
      this.forceUpdate()
    }
  }

  select = () => {
    const { model, select } = this.props
    const { offsetTop } = this.question
    select(model, offsetTop)
    this.forceUpdate()
  }

  openConfirmation = () => {
    this.setState({ showDeleteConfirmation: true })
  }

  render () {
    const { model, selectedModel } = this.props
    const { showDeleteConfirmation } = this.state
    const selected = selectedModel === model.id
    const style = {
      cursor: selected ? 'default' : 'pointer',
    }

    return (
      <div
        ref={(ref) => { this.question = ref }}
        onClick={this.select}
        className={`${styles.question} ${buttons.buttons} ${selected ? styles.selected : ''}`}
        style={style}
      >
        <QuestionInfoBar {...this.props} select={this.update} />
        <div className={styles.content}>
          <Header {...this.props} />
          <QuestionRenderer {...this.props} />
          <Footer {...this.props} />
        </div>
        {model.templateId && (
        <Confirmation
          show={showDeleteConfirmation}
          onConfirm={this.remove}
          onCancel={this.onCancelConfirm}
        >
          <p>Are you sure you want to remove? (with template)</p>
        </Confirmation>
        )}
        <Buttons {...this.props} selected={selected} remove={model.templateId ? this.openConfirmation : this.remove} />
      </div>
    )
  }
}

export default Question
