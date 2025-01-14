import { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import {
  Input, Dropdown, Collapse, Button,
} from 'antd'
import _ from 'lodash'
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
      showPrompt: false,
      showDeleteConfirmation: false,
      search: '',
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
    const {
      model, openRandomization, enableSingleQuestionPage, toggleSingleQuestionPage,
    } = this.props
    openRandomization({
      id: model.id, entityName: 'question', enableSingleQuestionPage, toggleSingleQuestionPage,
    })
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

  addToTemplateItem () {
    const { model } = this.props
    if (!model.templateId) {
      return [{
        key: 'save_as_template',
        icon: <span className={`icon fa fa-floppy-o ${styles.menuicon}`} />,
        label: 'Save as a Template',
        onClick: this.saveAsTemplate,
      }]
    }
    return []
  }

  renderOptions () {
    const { model } = this.props
    return (
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            {
              key: 'background_settings',
              icon: <span className={`icon fa fa-picture-o ${styles.menuicon}`} />,
              label: 'Background Settings...',
              onClick: this.blockSettings,
            },
            {
              key: 'question_randomization',
              icon: <span className={`icon fa fa-random ${styles.menuicon}`} />,
              label: 'Randomization...',
              onClick: this.questionRandomization,
            },
            {
              key: 'copy',
              icon: <span className={`icon fa fa-copy ${styles.menuicon}`} />,
              label: 'Copy Block...',
              onClick: this.copy,
            },
            ...(model.props.staticContent ? [{
              key: 'remove_static_content',
              icon: <span className={`icon fa fa-trash ${styles.menuicon}`} />,
              label: 'Remove Static Content',
              onClick: this.removeStaticContent,
            }] : [{
              key: 'add_static_content',
              icon: <span className={`icon fa fa-list-alt ${styles.menuicon}`} />,
              label: 'Add Static Content',
              onClick: this.addStaticContent,
            }]),
            {
              key: 'move_up',
              icon: <span className={`icon fa fa-arrow-up ${styles.menuicon}`} />,
              label: 'Move Up...',
              onClick: this.moveUp,
            },
            {
              key: 'move_down',
              icon: <span className={`icon fa fa-arrow-down ${styles.menuicon}`} />,
              label: 'Move Down...',
              onClick: this.moveDown,
            },
            {
              key: 'delete',
              icon: <span className={`icon fa fa-trash ${styles.menuicon}`} />,
              label: 'Delete Block...',
              onClick: model.templateId ? this.openConfirmation : this.remove,
            },
            ...this.addToTemplateItem(),
          ],
        }}
      >
        <Button icon={<span className="icon fa fa-gear" />}>Block Options</Button>
      </Dropdown>
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
    const {
      model, first, assessmentDefaultLanguage, currentLocale,
    } = this.props
    const {
      showPrompt, showDeleteConfirmation, search,
    } = this.state

    const showOptions = assessmentDefaultLanguage === currentLocale

    return (
      <Collapse
        className={styles.block}
        defaultActiveKey={[model.id]}
          // onChange={onChange}
        items={[{
          key: model.id,
          label: (
            <div className={styles.header}>
              <div className={styles.expander}>
                {showOptions ? <InlineEditor value={model.name} onChange={this.changeName} /> : model.name}
              </div>
              {model.questions.length > 100 && (
                <div className={styles.search}>
                  <Input.Search
                    placeholder="type to search question"
                    className={styles.input}
                    onChange={e => this.setState({ search: e.currentTarget.value })}
                    allowClear
                  />
                </div>
              )}
              <div>
                {this.renderRandomLabel()}
                {showOptions ? <div className={styles.options}>{this.renderOptions()}</div> : null}
              </div>
            </div>
          ),
          headerClass: styles.header,
          className: styles.content,
          collapsible: 'icon',
          children: (
            <>
              {this.isTemplate(model) && this.renderTemplateWarning()}
              {(model.props.staticContent) && <StaticContent model={model} />}
              <div
                ref={first ? this.questionContentRef : undefined}
                className={[styles.content]}
              >
                <QuestionList block={model} search={search} />
                {showOptions ? <Footer {...this.props} onMinimize={this.expand} /> : null}
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
            </>
          ),
        }]}
      />
    )
  }
}

export default Block
