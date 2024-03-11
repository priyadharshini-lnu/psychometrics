import { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import QuestionList from '~/modules/survey/views/QuestionList'
import BlockModel from '~/modules/survey/models/Block'
import InlineEditor from '~/modules/survey/components/InlineEditor'
import Prompt from '~/modules/survey/components/Prompt'
import Confirmation from '~/modules/survey/components/Confirmation'
import Footer from './BlockFooter'
import styles from './Block.less'
import StaticContent from './StaticContent'
import { NORMAL_TOP, STRETCH } from './StaticContent/settings'

class Block extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    last: PropTypes.bool,
    first: PropTypes.bool,
  }

  constructor (props) {
    super(props)
    this.questionContentRef = createRef(null)
    this.state = {
      opened: true,
      showPrompt: false,
      showDeleteConfirmation: false,
    }
  }

  componentDidMount () {
    if (this.questionContentRef.current) {
      const { setFirstBlockContentOffset } = this.props
      const { offsetTop } = this.questionContentRef.current
      setFirstBlockContentOffset(offsetTop)
    }
  }

  onCancelConfirm = () => {
    this.setState({ showDeleteConfirmation: false })
  }

  expand = () => {
    const { opened } = this.state
    const { unselectQuestion } = this.props
    unselectQuestion()
    this.setState({ opened: !opened })
  }

  changeName = (value) => {
    const { renameBlock, model } = this.props
    renameBlock(model, value)
  }

  remove = () => {
    const { removeBlock, model } = this.props
    removeBlock(model)
    this.setState({ showDeleteConfirmation: false })
  }

  moveDown = () => {
    const { model, moveBlockDown } = this.props
    moveBlockDown(model)
  }

  moveUp = () => {
    const { model, moveBlockUp } = this.props
    moveBlockUp(model)
  }

  addStaticContent = () => {
    const { model, updateBlockProps } = this.props
    updateBlockProps(model, {
      staticContent: {
        backgroundImageOptions: STRETCH,
        layout: NORMAL_TOP,
      },
    })
  }

  removeStaticContent = () => {
    const { model, updateBlockProps } = this.props
    updateBlockProps(model, { staticContent: null })
  }

  copy = () => {
    this.setState({ showPrompt: true })
  }

  questionRandomization = () => {
    const { model, openRandomization } = this.props
    openRandomization({ id: model.id, entityName: 'question' })
  }

  blockSettings = () => {
    const { model, openSettings } = this.props
    openSettings({ id: model.id, entityName: 'question' })
  }

  confirm = (name) => {
    const { cloneBlock, model } = this.props
    this.setState({ showPrompt: false })
    const newBlock = new BlockModel(_.extend({}, model, { id: null, name }))
    cloneBlock(newBlock)
  }

  cancel = () => {
    this.setState({ showPrompt: false })
  }

  saveAsTemplate = () => {
    const { saveAsTemplate, model } = this.props
    saveAsTemplate(model)
  }

  unlinkTemplate = () => {
    const { unlinkTemplate, model } = this.props
    unlinkTemplate(model)
  }

  openConfirmation = () => {
    this.setState({ showDeleteConfirmation: true })
  }

  isTemplate = model => model.templateId || model.saveAsTemplate

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
        onClick={e => e.stopPropagation(e)}
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
        <MenuItem onSelect={this.blockSettings}>
          <span className={`icon fa fa-picture-o ${styles.menuicon}`} />
          Background Settings...
        </MenuItem>
        <MenuItem onSelect={this.questionRandomization}>
          <span className={`icon fa fa-random ${styles.menuicon}`} />
          Question Randomization...
        </MenuItem>
        <MenuItem onSelect={this.copy}>
          <span className={`icon fa fa-copy ${styles.menuicon}`} />
          Copy Block...
        </MenuItem>
        {model.props.staticContent ? (
          <MenuItem onSelect={this.removeStaticContent}>
            <span className={`icon fa fa-trash ${styles.menuicon}`} />
            Remove Static Content
          </MenuItem>
        ) : (
          <MenuItem onSelect={this.addStaticContent}>
            <span className={`icon fa fa-list-alt ${styles.menuicon}`} />
            Add Static Content
          </MenuItem>
        )}
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
    const { model, first } = this.props
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
        {this.isTemplate(model) && this.renderTemplateWarning()}
        {(model.props.staticContent) && <StaticContent model={model} />}
        <div
          ref={first ? this.questionContentRef : undefined}
          className={[styles.content]}
          style={{ display: opened ? 'block' : 'none' }}
        >
          <QuestionList block={model} />
          <Footer {...this.props} onMinimize={this.expand} />
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
