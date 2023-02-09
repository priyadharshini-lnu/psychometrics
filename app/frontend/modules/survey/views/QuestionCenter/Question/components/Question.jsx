import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Question.less'
import Footer from './QuestionFooter'
import Header from './QuestionHeader'
import QuestionInfoBar from './QuestionInfoBar'
import QuestionRenderer from './QuestionRenderer'

const HEADER_HIEGHT = 40
const HEADER_PADDING = 30

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  update = () => {
    this.forceUpdate()
  }

  select = () => {
    const { model, select } = this.props
    let offsetTop = this.question.getBoundingClientRect().top
    if (document.body.scrollTop < HEADER_HIEGHT + HEADER_PADDING) {
      offsetTop = HEADER_PADDING
    } else {
      offsetTop = document.body.scrollTop - HEADER_HIEGHT
    }
    select(model, offsetTop)
    this.forceUpdate()
  }

  render () {
    return (
      <div
        ref={(ref) => { this.question = ref }}
        onClick={this.select}
        className={`${styles.question} ${styles.selected}`}
      >
        <QuestionInfoBar {...this.props} select={this.update} />
        <div className={styles.content}>
          <Header {...this.props} />
          <QuestionRenderer {...this.props} />
          <Footer {...this.props} />
        </div>
      </div>
    )
  }
}

export default Question
