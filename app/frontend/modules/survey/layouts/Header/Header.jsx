import { Component } from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { TimePicker } from 'antd'
import _ from 'lodash'
import moment from 'moment'

import ActionsHistory from '~/modules/survey/components/ActionsHistory'
import Block from '~/modules/survey/models/Block'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import { perform } from '~/modules/survey/core/temp/socket'
import NotificationDispatcher from '~/modules/survey/dispatchers/NotificationDispatcher'
import SerializeAssessment from '~/modules/survey/core/builder/assessment/SerializeAssessment'
import { TYPES as CAMPAIGN_TYPES } from '~/constants/campaign'
import styles from './Header.less'

const { I18n } = window

export class Header extends Component {
  openDataSheetModal = () => {
    const { openDataSheetModal, assessment } = this.props
    openDataSheetModal({ columns: assessment.data_sheet_columns, id: assessment.id })
  }

  openFlow = () => {
    const { openFlow } = this.props
    openFlow()
  }

  createBlock = () => {
    const { createBlock } = this.props
    createBlock(new Block())
  }

  showScoring = () => {
    const { history, match: { params: { id } } } = this.props
    history.push(`/administration/assessments/${id}/scoring`)
  }

  showResourceManager = () => {
    const { history, match: { params: { id } } } = this.props
    history.push(`/administration/assessments/${id}/resources`)
  }

  openSearchPopup = () => {
    const { openCreateByTemplate } = this.props
    openCreateByTemplate({ entityName: 'Block' })
  }

  showMappingNorms = () => {
    const { openMapNorms } = this.props
    perform('assessment_norms', { without_notification: true }, (data) => {
      openMapNorms({ data })
    })
  }

  export = () => {
    const { blocksWithQuestions, instructions } = this.props
    const result = {
      block: {},
      question: {},
      flow: {},
      instructions: { [null]: { content: instructions.content } },
    }

    _.each(blocksWithQuestions, (block) => {
      result.block[block.id] = {
        staticContent: _.get(block, ['props', 'staticContent', 'value']),
      }
      _.each(block.questions, (question) => {
        result.question[question.id] = QuestionSerializer.wrap(question).exportLocales()
      })
    })
    this.data.value = JSON.stringify(result)
    this.form.submit()
  }

  toggleTimer = () => {
    const { assessment: { extra }, updateExtra } = this.props
    const isAssessmentTimerAdded = extra && Object.prototype.hasOwnProperty.call(extra, 'timer')

    if (isAssessmentTimerAdded) {
      updateExtra(_.omit(extra, 'timer'))
    } else {
      updateExtra({ ...extra, timer: null })
    }
  }

  updateTimer = (time) => {
    const { assessment: { extra }, updateExtra } = this.props
    const timer = time && moment.duration(time.format('HH:mm:ss')).asSeconds()
    updateExtra({ ...extra, timer })
  }

  openPreview = () => {
    const { builder } = this.props
    this.previewData.value = JSON.stringify(SerializeAssessment.run(builder))
    this.previewForm.submit()
  }

  save = () => {
    const { saveAssessment, builder } = this.props
    saveAssessment(builder).then(() => {
      NotificationDispatcher.notify({ message: 'Assessment successfully saved' })
    }).catch(() => {
      NotificationDispatcher.notify({ level: 'error', message: 'Something went wrong. Contact your administrator.' })
    })
  }

  render () {
    const {
      assessment, assessment: { extra, saving }, toggleEnableBack, toggleEnableProgress, toggleSingleQuestionPage,
      instructions, toggleInstructions,
    } = this.props

    const isThreeSixtyAsessment = assessment && assessment.category === CAMPAIGN_TYPES.THREESIXTY
    const isAssessmentTimerAdded = extra && Object.prototype.hasOwnProperty.call(extra, 'timer')

    return (
      <div className={`panel-heading ${styles.menu}`}>
        <div>
          <h3 className="panel-title">
            {assessment.name}
          </h3>
        </div>
        <ul className="panel-controls">
          {isAssessmentTimerAdded && (
            <li>
              Timer:
              <TimePicker
                value={(extra.timer || extra.timer === 0) ? moment.utc(extra.timer * 1000) : null}
                onChange={this.updateTimer}
                placeholder="Set timer"
                defaultOpenValue={moment.utc(0)}
                className="mhs"
                dropdownClassName="assessment-timer"
              />
            </li>
          )}
          <li>
            <button className={`btn btn-default ${styles.flow}`} onClick={this.openFlow}>Flow</button>
          </li>
          <li>
            <button onClick={this.openPreview} className={`btn btn-default ${styles.preview}`}>
              Preview
            </button>
          </li>
          <li>
            <button onClick={this.showScoring} className={`btn btn-default ${styles.preview}`}>
              Scoring
            </button>
          </li>
          <li>
            <button onClick={this.showResourceManager} className={`btn btn-default ${styles.preview}`}>
              Resource Manager
            </button>
          </li>
          <li>
            <button onClick={this.showMappingNorms} className={`btn btn-default ${styles.preview}`}>
              Map norms
            </button>
          </li>

          {assessment && (
            <li>
              <span>
                <a
                  href={`/administration/reports?q[assessment_id_in][]=${assessment.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn btn-default ${styles.preview}`}
                >
                  Reports
                </a>
              </span>
            </li>
          )}
          <li className={styles.spaceLeft}><ActionsHistory /></li>
          <li>
            <DropdownButton
              className={styles.dropdown}
              pullRight
              bsStyle="default"
              onClick={e => e.stopPropagation(e)}
              title={(
                <span>
                  <span className="icon fa fa-gear" />
                  Options
                </span>
              )}
              id="main_menu"
            >
              <MenuItem onSelect={this.createBlock}>Add Block</MenuItem>
              {!isThreeSixtyAsessment && (
              <MenuItem onSelect={toggleInstructions}>
                {instructions.enabled ? 'Hide' : 'Show'}
                {' '}
                Instructions
              </MenuItem>
              )}
              <MenuItem onSelect={this.openSearchPopup}>Copy Block From...</MenuItem>
              <MenuItem onSelect={this.export}>Export Translations</MenuItem>
              <li>
                <a
                  className={styles.linkExport}
                  data-remote="true"
                  href={`/administration/translations/assessments/${_.result(assessment, 'id')}/new`}
                >
                  Import Translations
                </a>
              </li>
              <MenuItem onSelect={toggleEnableBack}>
                {_.result(assessment, 'enable_back') ? 'Disable Back Button' : 'Enable Back Button'}
              </MenuItem>
              <MenuItem onSelect={toggleEnableProgress}>
                {_.result(assessment, 'enable_progress') ? 'Disable Progress Bar' : 'Enable Progress Bar'}
              </MenuItem>
              <MenuItem onSelect={toggleSingleQuestionPage}>
                {_.result(assessment, 'options.enable_single_question_page')
                  ? 'Disable Single Question Per Page'
                  : 'Enable Single Question Per Page'}
              </MenuItem>
              {!isThreeSixtyAsessment
              && (
              <MenuItem onSelect={this.toggleTimer}>
                {isAssessmentTimerAdded
                  ? I18n.t('administration.assessments.menus.remove_timer')
                  : I18n.t('administration.assessments.menus.add_timer')}
              </MenuItem>
              )}
              <MenuItem onSelect={this.openDataSheetModal}>Manage Datasheet</MenuItem>
            </DropdownButton>
            <form
              style={{ display: 'none' }}
              ref={(ref) => { this.form = ref }}
              action={`/administration/translations/assessments/${_.result(assessment, 'id')}/export`}
              method="POST"
            >
              <input
                name="authenticity_token"
                type="hidden"
                value={document.querySelector('meta[name="csrf-token"]').getAttribute('content')}
              />
              <input ref={(ref) => { this.data = ref }} name="data" />
            </form>
            <form
              style={{ display: 'none' }}
              ref={(ref) => { this.previewForm = ref }}
              target="_blank"
              action={`${location.pathname}/preview`}
              method="POST"
            >
              <input
                name="authenticity_token"
                type="hidden"
                value={document.querySelector('meta[name="csrf-token"]').getAttribute('content')}
              />
              <input ref={(ref) => { this.previewData = ref }} name="data" />
            </form>
          </li>
          <li>
            <button onClick={this.save} disabled={saving} className={`btn btn-success ${styles.saveButton}`}>
              <i className="fa fa-save" />
              Save
            </button>
          </li>
        </ul>
      </div>
    )
  }
}

export default Header
