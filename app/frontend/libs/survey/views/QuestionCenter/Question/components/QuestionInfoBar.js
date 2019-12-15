import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import InlineEditor from 'components/InlineEditor'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import RandomizationStore from 'store/RandomizationStore'
import styles from './Question.scss'

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  }

  addNote = () => {
    const { model } = this.props
    model.addNote()
  }

  invokeAdvanced = (element) => {
    const { model } = this.props
    _.invoke(model, element.callback)
  }

  randomization = () => {
    const { model } = this.props
    RandomizationStore.open(model, 'choice')
  }

  changeName = (value) => {
    const { model, store } = this.props
    store.dispatcher.rename(model, value)
    model.rename(value)
    model.name = value
    this.forceUpdate()
  }

  renderRandomMenuItem () {
    const { model } = this.props

    if (model.moduleConfig.randomization) {
      return (
        <MenuItem onSelect={this.randomization}>
          <span className={`icon fa fa-random ${styles.menuicon}`} />
          Randomization...
        </MenuItem>
      )
    }
    return null
  }

  renderOptions () {
    const { model } = this.props
    return (
      <DropdownButton
        className={styles.dropdown}
        bsStyle="default"
        title={<span className="icon fa fa-gear" />}
        id={`block_menu_${model.id}`}
      >
        <MenuItem onSelect={this.addNote}>
          <span className={`icon fa fa-pencil-square-o ${styles.menuicon}`} />
          Add Note...
        </MenuItem>
        {this.renderRandomMenuItem()}
      </DropdownButton>
    )
  }

  renderRandomLabel () {
    const { model } = this.props
    if (model.moduleConfig.randomization) {
      return model.props.randomization.type !== 'No' && (
        <div title="This question has randomization" className={styles.randomized}>
          <span className="fa fa-random" />
        </div>
      )
    }
    return null
  }

  render () {
    const { model } = this.props
    return (
      <div className={styles.infobar}>
        <InlineEditor styles={styles.editable} onChange={this.changeName} value={model.name} />
        {this.renderOptions()}
        {this.renderRandomLabel()}
      </div>
    )
  }
}

export default Question
