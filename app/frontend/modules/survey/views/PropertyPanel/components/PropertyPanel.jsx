import { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {
  Divider, Checkbox, Space, ConfigProvider,
} from 'antd'
import Action from '~/modules/survey/undo'
import LogicElement from '~/modules/survey/models/logic/LogicElement'
import Question from '~/modules/survey/models/Question'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import Menu from '~/modules/survey/components/ModulesMenu'
import { Properties } from '~/modules/survey/components/modules'
import styles from './PropertyPanel.less'

class PropertyPanel extends Component {
  static propTypes = {
    restricted: PropTypes.bool,
  }

  addNote = () => {
    const { question, addNote } = this.props
    addNote(question)
  }

  addPageBreak = () => {
    const { question, addPageBreak } = this.props
    addPageBreak(question, new Question({ name: 'PB', type: 'PageBreak' }))
  }

  preview = () => {
    const { question, openPreview } = this.props
    openPreview({ question })
  }

  copyQuestion = () => {
    const { copyQuestion, question } = this.props
    const newQuestionParams = _.extend({}, _.cloneDeep(question), { id: null })
    const newQuestion = new Question(newQuestionParams)
    copyQuestion(question, newQuestion)
  }

  displayLogic = () => {
    const { question, openDisplayLogic } = this.props
    openDisplayLogic({ question, logicElement: question.displayLogic || new LogicElement() })
  }

  addSkipLogic = () => {
    const { question, addSkipLogic } = this.props
    addSkipLogic(question)
  }

  changeType = (type, props = {}) => {
    const { question, changeType } = this.props
    if (question.type === type && _.isEmpty(props)) { return }
    Action('QuestionChangeType', question, { oldType: question.type, newType: type })
    changeType(question, type, props)
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

  renderCommonProperties (model) {
    const { allowContentCopy } = model.props

    return (
      <div className={styles.fieldset}>
        <Checkbox
          onChange={({ target: { checked } }) => model.changeProps({ allowContentCopy: checked })}
          defaultChecked={allowContentCopy}
        >
          {I18n.t('administration.survey_builder.property_panel.allow_content_copy')}
        </Checkbox>
      </div>
    )
  }

  render () {
    const { question, offset } = this.props
    const style = {
      top: offset,
      visibility: question ? 'visible' : 'hidden',
    }

    if (!question) { return null }
    const q = QuestionSerializer.wrap(question)
    return (
      <ConfigProvider componentSize="small">
        <Space
          className={styles.main}
          style={style}
          key={q.id}
          direction="vertical"
          split={<Divider style={{ margin: 0 }} />}
          size={1}
        >
          {this.renderQuestiontypeBtn(q)}
          {this.renderCustomProperties(q)}
          {this.renderCommonProperties(q)}
          {this.renderDefaultAction(q)}
        </Space>
      </ConfigProvider>
    )
  }
}

export default PropertyPanel
