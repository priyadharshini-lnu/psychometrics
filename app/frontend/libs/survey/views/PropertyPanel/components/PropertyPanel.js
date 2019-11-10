import React, { Component } from 'react'
import PropTypes from 'prop-types'
import store from 'store/PropertyPanelStore'
import PreviewStore from 'store/PreviewStore'
import { Properties } from 'components/modules'
import Menu from 'components/ModulesMenu'
import Action from 'undo'
import LogicElement from 'models/logic/LogicElement'
import styles from './PropertyPanel.scss'

class PropertyPanel extends Component {
  static propTypes = {
    restricted: PropTypes.bool,
  }

  storeListener = null

  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  addNote = () => {
    store.question.addNote()
  }

  addPageBreak = () => {
    store.question.addPageBreak()
  }

  preview = () => {
    PreviewStore.preview(store.question)
  }

  copyQuestion = () => {
    store.question.clone()
  }

  displayLogic = () => {
    const { openDisplayLogic } = this.props
    openDisplayLogic({ question: store.question, logicElement: store.question.displayLogic || new LogicElement() })
  }

  addSkipLogic = () => {
    store.question.addSkipLogic()
  }

  changeType = (type, props = {}) => {
    if (store.question.type === type && props === {}) { return }
    Action('QuestionChangeType', store.question, { oldType: store.question.type, newType: type })
    store.question.changeType(type, props)
    store.update()
  }

  renderDefaultAction () {
    const { restricted } = this.props
    return (
      <div className={styles.fieldset}>
        {!restricted && (
          <a onClick={this.addPageBreak} className={styles.menuitem}>
            <span className={`fa fa-file-o ${styles.icon}`} />
            <span>Add Page Break</span>
          </a>
        )}
        {!restricted && (
          <a onClick={this.displayLogic} className={styles.menuitem}>
            <span className={`fa fa-eye ${styles.icon}`} />
            <span>Add Display Logic</span>
          </a>
        )}
        {!restricted && (
          <a onClick={this.addSkipLogic} className={styles.menuitem}>
            <span className={`fa fa-eye-slash  ${styles.icon}`} />
            <span>Add Skip Logic</span>
          </a>
        )}
        {!restricted && (
          <a onClick={this.copyQuestion} className={styles.menuitem}>
            <span className={`fa fa-check-circle-o ${styles.icon}`} />
            <span>Copy Question</span>
          </a>
        )}
        {!restricted && (
          <a onClick={this.addNote} className={styles.menuitem}>
            <span className={`fa fa-pencil-square-o ${styles.icon}`} />
            <span>Add Note</span>
          </a>
        )}
        <a onClick={this.preview} className={styles.menuitem}>
          <span className={`icon fa fa-search ${styles.icon}`} />
          <span>Preview Question</span>
        </a>
      </div>
    )
  }

  renderQuestiontypeBtn (model) {
    return (
      <div className={styles.fieldset} style={{ position: 'relative' }}>
        <span className={styles.label}>Change Question Type</span>
        <button type="button" data-toggle="dropdown" className={`btn btn-success dropdown-toggle ${styles.menuButton}`}>
          <span className={`fa fa-${model.moduleConfig.icon} ${styles.icon}`} />
          <span>{model.moduleConfig.moduleName}</span>
          <span className="caret" />
        </button>
        <Menu onSelect={this.changeType} />
      </div>
    )
  }

  renderCustomProperties (model) {
    const { restricted } = this.props
    const View = Properties[`${model.type}Properties`]
    if (!View) { return null }
    return <View model={model} restricted={restricted} />
  }

  render () {
    const model = store.question
    const style = {
      top: store.offset,
      visibility: store.question ? 'visible' : 'hidden',
    }
    if (!model) { return null }
    return (
      <div className={styles.main} style={style}>
        {this.renderQuestiontypeBtn(model)}
        <hr className={styles.divider} />
        {this.renderCustomProperties(model)}
        <hr className={styles.divider} />
        {this.renderDefaultAction(model)}
      </div>
    )
  }
}

export default PropertyPanel
