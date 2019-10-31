import React, { Component } from 'react'
import PropTypes from 'prop-types'
import InlineEditor from 'components/InlineEditor'
import BlockListDispatcher from 'dispatchers/BlockListDispatcher'
import BlockDispatcher from 'dispatchers/BlockDispatcher'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import Prompt from 'components/Prompt'
import QuestionList from 'views/QuestionList'
import PropertyPanelStore from 'store/PropertyPanelStore'
import RandomizationStore from 'store/RandomizationStore'
import BlockList from 'store/BlockList'
import Confirmation from 'components/Confirmation'
import Footer from './BlockFooter'
import styles from './Block.scss'

class Block extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    last: PropTypes.bool,
  }

  state = {
    opened: true,
    showPrompt: false,
    showDeleteConfirmation: false,
  }

  componentDidMount () {
    this.popupListener = RandomizationStore.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.popupListener.remove()
  }

  expand = () => {
    const { opened } = this.state
    PropertyPanelStore.question = null
    this.setState({ opened: !opened })
  }

  changeName = (value) => {
    const { model } = this.props
    BlockDispatcher.rename(model, value)
    this.forceUpdate()
  }

  remove = () => {
    const { model } = this.props
    BlockListDispatcher.clickRemove(model)
    this.setState({ showDeleteConfirmation: false })
  }

  moveDown = () => {
    const { model } = this.props
    BlockListDispatcher.moveDown(model)
  }

  moveUp = () => {
    const { model } = this.props
    BlockListDispatcher.moveUp(model)
  }

  copy = () => {
    this.setState({ showPrompt: true })
  }

  questionRandomization = () => {
    const { model } = this.props
    RandomizationStore.open(model, 'question')
  }

  confirm = (name) => {
    const { model } = this.props
    this.setState({ showPrompt: false })
    BlockListDispatcher.clone(model, name)
  }

  cancel = () => {
    this.setState({ showPrompt: false })
  }

  saveAsTemplate = () => {
    const { model } = this.props
    BlockList.saveAsTemplate(model)
  }

  unlinkTemplate = () => {
    const { model } = this.props
    BlockList.unlinkTemplate(model)
  }

  onCancelConfirm = () => {
    this.setState({ showDeleteConfirmation: false })
  }

  openConfirmation = () => {
    this.setState({ showDeleteConfirmation: true })
  }

  renderAddToTemplate () {
    const { model } = this.props
    if (!model.templateId) {
      return (
        <MenuItem onSelect={this.saveAsTemplate}>
          <span className={`icon fa fa-floppy-o ${styles.menuicon}`} />
          Save as a Template
        </MenuItem>
      )
    }
  }

  renderOptions () {
    const { model } = this.props
    return (
      <DropdownButton
        className={styles.dropdown}
        bsStyle="default"
        title={(
          <span>
            <span className="icon fa fa-gear" />
            Block Options
          </span>
        )}
        id={`block_menu_${model.id}`}
      >
        <MenuItem onSelect={this.questionRandomization}>
          <span className={`icon fa fa-random ${styles.menuicon}`} />
          Question Randomization...
        </MenuItem>
        <MenuItem onSelect={this.copy}>
          <span className={`icon fa fa-copy ${styles.menuicon}`} />
          Copy Block...
        </MenuItem>
        <MenuItem onSelect={this.moveUp}>
          <span className={`icon fa fa-arrow-up ${styles.menuicon}`} />
          Move Up...
        </MenuItem>
        <MenuItem onSelect={this.moveDown}>
          <span className={`icon fa fa-arrow-down ${styles.menuicon}`} />
          Move Down...
        </MenuItem>
        <MenuItem onSelect={model.templateId ? this.openConfirmation : this.remove}>
          <span className={`icon ${styles.menuicon}`} />
          Delete Block...
        </MenuItem>
        {this.renderAddToTemplate()}
      </DropdownButton>
    )
  }

  renderRandomLabel () {
    const { model } = this.props
    if (model.props.randomization && model.props.randomization.type !== 'No') {
      return (
        <div className={styles.randomized}>
          <span className="fa fa-random" />
          Randomized
        </div>
      )
    }
  }

  renderTemplateWarning () {
    return (
      <div className={styles.templateWarning}>
        <div className={styles.templateHeader}>
          <div className={styles.title}>
            This is a template block and it can be used across multiple assessments.
            All changes to this block will apply across all assessments where it is used.
          </div>
          <button onClick={this.unlinkTemplate} className={`btn btn-default btn-sm ${styles.options}`}>
            Unlink
          </button>
        </div>
      </div>
    )
  }

  render () {
    const { model, last } = this.props
    const { opened, showPrompt, showDeleteConfirmation } = this.state
    const iconClass = `fa fa-chevron-down ${styles.icon} ${opened ? '' : 'fa-rotate-270'}`
    return (
      <div className={styles.block}>
        <div className={styles.header}>
          <div className={styles.expander}>
            <span onClick={this.expand} className={iconClass} />
            <InlineEditor value={model.name} onChange={this.changeName} />
          </div>
          <div>
            {this.renderRandomLabel()}
            <div className={styles.options}>{this.renderOptions()}</div>
          </div>

        </div>
        {model.isTemplate() && this.renderTemplateWarning()}
        <div className={[styles.content]} style={{ display: opened ? 'block' : 'none' }}>
          <QuestionList block={model} />
          <Footer model={model} onMinimize={this.expand} last={last} />
        </div>
        <Prompt
          title={`Copy Block - ${model.name}`}
          show={showPrompt}
          onConfirm={this.confirm}
          onCancel={this.cancel}
        >
          <h4>Please type a brief name / description for the new block:</h4>
        </Prompt>
        {model.templateId && (
        <Confirmation
          show={showDeleteConfirmation}
          onConfirm={this.remove}
          onCancel={this.onCancelConfirm}
        >
          <p>Are you sure you want to remove? (with template)</p>
        </Confirmation>
        )}
      </div>
    )
  }
}

export default Block
