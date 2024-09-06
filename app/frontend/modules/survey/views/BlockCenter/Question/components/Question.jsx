import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Question.less'
import buttons from './Buttons.less'
import Buttons from './Buttons'
import Header from './QuestionHeader'
import QuestionInfoBar from './QuestionInfoBar'
import QuestionRenderer from './QuestionRenderer'

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  remove = () => {
    const {
      block, model, removeQuestion,
    } = this.props
    removeQuestion(block, model)
  }

  update = () => {
    this.forceUpdate()
  }

  select = () => {
    const { model, select } = this.props
    const { offsetTop } = this.question
    select(model, offsetTop)
    this.forceUpdate()
  }

  render () {
    const { model, selectedModel } = this.props
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
        </div>
        <Buttons {...this.props} remove={this.remove} selected={selected} />
      </div>
    )
  }
}

export default Question
