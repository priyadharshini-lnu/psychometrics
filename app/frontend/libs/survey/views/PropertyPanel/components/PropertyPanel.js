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

  addNote = () => {
    const { question } = this.props
    question.addNote()
  }

  addPageBreak = () => {
    const { question } = this.props
    question.addPageBreak()
  }

  preview = () => {
    const { question } = this.props
    PreviewStore.preview(question)
  }

  copyQuestion = () => {
    const { question } = this.props
    question.clone()
  }

  displayLogic = () => {
    const { question, openDisplayLogic } = this.props
    openDisplayLogic({ question, logicElement: question.displayLogic || new LogicElement() })
  }

  addSkipLogic = () => {
    const { question } = this.props
    question.addSkipLogic()
  }

  changeType = (type, props = {}) => {
    const { question } = this.props
    if (question.type === type && props === {}) { return }
    Action('QuestionChangeType', question, { oldType: question.type, newType: type })
    question.changeType(type, props)
    store.update()
    this.forceUpdate()
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
    const { question, offset } = this.props
    const style = {
      top: offset,
      visibility: question ? 'visible' : 'hidden',
    }
    if (!question) { return null }
    return (
      <div className={styles.main} style={style}>
        {this.renderQuestiontypeBtn(question)}
        <hr className={styles.divider} />
        {this.renderCustomProperties(question)}
        <hr className={styles.divider} />
        {this.renderDefaultAction(question)}
      </div>
    )
  }
}

export default PropertyPanel
