import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PropertyPanelStore from 'store/PropertyPanelStore'
import RandomizationStore from 'store/RandomizationStore'
import PropertyPanelDispatcher from 'dispatchers/PropertyPanelDispatcher'
import styles from './Question.scss'
import buttons from './Buttons.scss'
import Buttons from './Buttons'
import Footer from './QuestionFooter'
import Header from './QuestionHeader'
import QuestionInfoBar from './QuestionInfoBar'
import QuestionRenderer from './QuestionRenderer'

const HEADER_HIEGHT = 40
const HEADER_PADDING = 30

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  }

  state = {
    fadeout: false,
  }

  componentDidMount () {
    this.propPanelListener = PropertyPanelStore.addListener('change', () => this.forceUpdate())
    this.popupListener = RandomizationStore.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.propPanelListener.remove()
    this.popupListener.remove()
  }

  remove = () => {
    const { store, model } = this.props
    this.setState({ fadeout: true })
    setTimeout(() => {
      store.dispatcher.clickRemove(model)
      PropertyPanelDispatcher.unselect()
      if (this.isMounted()) {
        this.setState({ fadeout: false })
      }
    }, 400)
  }

  update = () => {
    this.forceUpdate()
  }

  select = () => {
    const { model } = this.props
    let offsetTop = this.question.getBoundingClientRect().top
    if (document.body.scrollTop < HEADER_HIEGHT + HEADER_PADDING) {
      offsetTop = HEADER_PADDING
    } else {
      offsetTop = document.body.scrollTop - HEADER_HIEGHT
    }
    PropertyPanelDispatcher.select(model, offsetTop)
    this.forceUpdate()
  }

  render () {
    const { model } = this.props
    const { fadeout } = this.state
    const selected = PropertyPanelStore.question === model
    const style = {
      opacity: fadeout ? 0 : 1,
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
        <Buttons {...this.props} remove={this.remove} />
      </div>
    )
  }
}

export default Question
