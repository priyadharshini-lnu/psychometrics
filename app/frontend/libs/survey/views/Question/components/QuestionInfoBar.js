import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import InlineEditor from 'components/InlineEditor'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import RandomizationStore from 'store/RandomizationStore'
import DefaultValueStore from 'store/DefaultValueStore'
import LogicElement from 'models/logic/LogicElement'
import styles from './Question.scss'

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    blockStore: PropTypes.object.isRequired,
  }

  addNote = () => {
    const { model } = this.props
    model.addNote()
  }

  addSkipLogic = () => {
    const { model } = this.props
    model.addSkipLogic()
  }

  invokeAdvanced = (element) => {
    const { model } = this.props
    _.invoke(model, element.callback)
  }

  randomization = () => {
    const { model } = this.props
    RandomizationStore.open(model, 'choice')
  }

  saveAsTemplate = () => {
    const { model, blockStore } = this.props
    blockStore.dispatcher.saveAsTemplate(model)
  }

  defaultValue = () => {
    const { model } = this.props
    DefaultValueStore.open(model)
  }

  displayLogic = () => {
    const { model, openDisplayLogic } = this.props
    openDisplayLogic({
      question: model,
      logicElement: model.displayLogic || new LogicElement(),
    })
  }

  changeName = (value) => {
    const { model, blockStore } = this.props
    blockStore.dispatcher.rename(model, value)
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

  renderAddToTemplate () {
    const { model } = this.props
    if (!model.templateId && !model.block.templateId) {
      return (
        <MenuItem onSelect={this.saveAsTemplate}>
          <span className={`icon fa fa-floppy-o ${styles.menuicon}`} />
          Save as a Template
        </MenuItem>
      )
    }
    return null
  }

  renderDefaultValueMenuItem () {
    const { model } = this.props
    if (model.moduleConfig.defaultValue) {
      return (
        <MenuItem onSelect={this.defaultValue}>
          <span className={`icon fa fa-dot-circle-o ${styles.menuicon}`} />
          Add Default Choices...
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
        <MenuItem onSelect={this.displayLogic}>
          <span className={`icon fa fa-eye ${styles.menuicon}`} />
          Add Display Logic...
        </MenuItem>
        <MenuItem onSelect={this.addSkipLogic}>
          <span className={`icon fa fa-eye-slash  ${styles.menuicon}`} />
          Add Skip Logic...
        </MenuItem>
        {this.renderDefaultValueMenuItem()}
        <MenuItem onSelect={this.addNote}>
          <span className={`icon fa fa-pencil-square-o ${styles.menuicon}`} />
          Add Note...
        </MenuItem>
        {this.renderRandomMenuItem()}
        {this.renderAddToTemplate()}
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

  renderDefaultValue () {
    const { model } = this.props
    if (model.moduleConfig.defaultValue) {
      return model.hasDefaultValues() && (
        <div title="This question has default choices" className={styles.randomized}>
          <span className="fa fa-dot-circle-o" />
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
        {this.renderDefaultValue()}
        {this.renderRandomLabel()}
      </div>
    )
  }
}

export default Question
