import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Question.scss'
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

  state = {
    fadeout: false,
  }

  componentWillUnmount () {
    this.popupListener.remove()
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
    const { model, selectedModel } = this.props
    const { fadeout } = this.state
    const selected = selectedModel === model
    const style = {
      opacity: fadeout ? 0 : 1,
      cursor: selected ? 'default' : 'pointer',
    }
    return (
      <div
        ref={(ref) => { this.question = ref }}
        onClick={this.select}
        className={`${styles.question} ${selected ? styles.selected : ''}`}
        style={style}
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
