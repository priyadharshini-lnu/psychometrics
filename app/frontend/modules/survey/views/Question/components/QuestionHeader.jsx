import { Component } from 'react'
import PropTypes from 'prop-types'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import LogicElement from '~/modules/survey/models/logic/LogicElement'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import LogicElementPreview from '~/modules/survey/components/LogicElement/Preview'
import InlineEditor from '~/modules/survey/components/InlineEditor'
import styles from './Question.less'

class QuestionHeader extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeName = (value) => {
    const { renameQuestion, model } = this.props
    renameQuestion(model, value)
  }

  removeDisplayLogic = () => {
    const { model } = this.props
    QuestionSerializer.wrap(model).clearDisplayLogic()
  }

  unlinkTemplate = () => {
    const { unlinkTemplate, model } = this.props
    unlinkTemplate(model)
  }

  isTemplate (model) {
    return model.template_id || model.save_as_template
  }

  renderDisplayLogic () {
    const { model, openDisplayLogic } = this.props
    const logicElement = model.display_logic
    return (
      <div className={styles.displayLogic}>
        <div className={styles.displayHeader}>
          <div className={styles.title}>Display This Question:</div>
          <DropdownButton
            onClick={e => e.stopPropagation(e)}
            id={`display_options_${model.id}`}
            className={styles.options}
            bsStyle="default"
            bsSize="small"
            title="Options"
          >
            <MenuItem onSelect={() => openDisplayLogic({
              question: model,
              logicElement: logicElement || new LogicElement(),
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
    const { model, block } = this.props
    return (
      <div className={styles.header}>
        <div className={styles.questionMeta}>
          <InlineEditor styles={styles.questionName} onChange={this.changeName} value={model.name} />
        </div>
        {this.isTemplate(model) && !this.isTemplate(block) && this.renderTemplateWarning()}
        {model.display_logic && this.renderDisplayLogic()}
      </div>
    )
  }
}

export default QuestionHeader
