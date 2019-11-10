import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import LogicElementPreview from 'components/LogicElement/Preview'
import LogicElement from 'models/logic/LogicElement'
import styles from './Question.scss'

class QuestionHeader extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    blockStore: PropTypes.object.isRequired,
  }

  removeDisplayLogic = () => {
    const { model } = this.props
    model.clearDisplayLogic()
    model.update()
  }

  unlinkTemplate = () => {
    const { model, blockStore } = this.props
    blockStore.dispatcher.unlinkTemplate(model)
  }

  renderDisplayLogic () {
    const { model, openDisplayLogic } = this.props
    const logicElement = model.displayLogic
    return (
      <div className={styles.displayLogic}>
        <div className={styles.displayHeader}>
          <div className={styles.title}>Display This Question:</div>
          <DropdownButton
            id={`display_options_${model.id}`}
            className={styles.options}
            bsStyle="default"
            bsSize="small"
            title="Options"
          >
            <MenuItem onSelect={() => openDisplayLogic({
              question: model,
              logicElement: model.displayLogic || new LogicElement(),
            })}
            >
              <span className={`${styles.menuicon}`} />
              Edit
            </MenuItem>
            <MenuItem onSelect={this.removeDisplayLogic}>
              <span className={`${styles.menuicon}`} />
              Remove
            </MenuItem>
          </DropdownButton>
        </div>
        <LogicElementPreview logic={logicElement} />
      </div>
    )
  }

  renderTemplateWarning () {
    return (
      <div className={styles.templateWarning}>
        <div className={styles.templateHeader}>
          <div className={styles.title}>
            This is a template question and it can be used across multiple assessments.
            All changes to this question will apply across all assessments where it is used.
          </div>
          <button onClick={this.unlinkTemplate} className={`btn btn-default btn-sm ${styles.options}`}>Unlink</button>
        </div>
      </div>
    )
  }

  render () {
    const { model } = this.props
    return (
      <div className={styles.header}>
        {model.isTemplate() && !model.block.isTemplate() && this.renderTemplateWarning()}
        {model.displayLogic && this.renderDisplayLogic()}
      </div>
    )
  }
}

export default QuestionHeader
