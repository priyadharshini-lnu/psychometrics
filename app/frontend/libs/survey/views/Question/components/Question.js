import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PropertyPanelStore from 'store/PropertyPanelStore'
import RandomizationStore from 'store/RandomizationStore'
import PropertyPanelDispatcher from 'dispatchers/PropertyPanelDispatcher'
import Confirmation from 'components/Confirmation'
import styles from './Question.scss'
import Footer from './QuestionFooter'
import Header from './QuestionHeader'
import QuestionInfoBar from './QuestionInfoBar'
import QuestionRenderer from './QuestionRenderer'
import Buttons from './Buttons'
import buttons from './Buttons.scss'

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  }

  state = {
    fadeout: false,
    showDeleteConfirmation: false,
  }

  componentDidMount () {
    this.propPanelListener = PropertyPanelStore.addListener('change', () => this.forceUpdate())
    this.popupListener = RandomizationStore.addListener('change', () => this.forceUpdate())
    this.mounted = true
  }

  componentWillUnmount () {
    this.propPanelListener.remove()
    this.popupListener.remove()
    this.mounted = false
  }

  remove = () => {
    const { model, store } = this.props
    this.setState({ fadeout: true, showDeleteConfirmation: false })
    setTimeout(() => {
      store.dispatcher.clickRemove(model)
      PropertyPanelDispatcher.unselect()
      if (this.mounted) {
        this.setState({ fadeout: false })
      }
    }, 400)
  }

  update = () => {
    this.forceUpdate()
  }

  select = () => {
    const { model } = this.props
    const { offsetTop } = this.question
    PropertyPanelDispatcher.select(model, offsetTop)
    this.forceUpdate()
  }

  onCancelConfirm = () => {
    this.setState({ showDeleteConfirmation: false })
  }

  openConfirmation = () => {
    this.setState({ showDeleteConfirmation: true })
  }

  render () {
    const { model } = this.props
    const { fadeout, showDeleteConfirmation } = this.state
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
        {model.templateId && (
        <Confirmation
          show={showDeleteConfirmation}
          onConfirm={this.remove}
          onCancel={this.onCancelConfirm}
        >
          <p>Are you sure you want to remove? (with template)</p>
        </Confirmation>
        )}
        <Buttons {...this.props} remove={model.templateId ? this.openConfirmation : this.remove} />
      </div>
    )
  }
}

export default Question
