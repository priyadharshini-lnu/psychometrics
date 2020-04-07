import _ from 'lodash'
import React, { Component } from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import ActionsHistory from 'libs/survey/components/ActionsHistory'
import Block from 'libs/survey/models/Block'
import QuestionSerializer from 'libs/survey/models/QuestionSerializer'
import { perform } from 'libs/survey/core/temp/socket'
import NotificationDispatcher from 'libs/survey/dispatchers/NotificationDispatcher'
import SerializeAssessment from 'libs/survey/core/builder/assessment/SerializeAssessment'
import { TimePicker } from 'antd'
import moment from 'moment'
import styles from './Header.scss'

export class Header extends Component {
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
    const { blocksWithQuestions } = this.props
    const result = {
      block: {},
      question: {},
      flow: {},
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

  addTimer = () => {
    const { assessment: { extra }, updateExtra } = this.props
    updateExtra({ ...extra, timer: null })
  }

  removeTimer = () => {
    const { assessment: { extra }, updateExtra } = this.props
    updateExtra(_.omit(extra, 'timer'))
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
      assessment, assessment: { extra, saving }, toggleEnableBack, toggleEnableProgress,
    } = this.props

    return (
      <div className={`panel-heading ${styles.menu}`}>
        <div>
          <h3 className="panel-title">
            {assessment.name}
          </h3>
        </div>
        <ul className="panel-controls">
          {_.has(extra, 'timer') && (
            <li>
              Timer:
              <TimePicker
                value={(extra.timer || extra.timer === 0) ? moment.utc(extra.timer * 1000) : null}
                onChange={this.updateTimer}
                placeholder="Set timer"
                defaultOpenValue={moment.utc(0)}
                className="mls mrl"
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
              title={(
                <span>
                  <span className="icon fa fa-gear" />
                  Options
                </span>
              )}
              id="main_menu"
            >
              <MenuItem onSelect={this.createBlock}>Add Block</MenuItem>
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
              <li>
                <a
                  className={styles.linkExport}
                  href={`/administration/assessments/${_.result(assessment, 'id')}/export.xlsx`}
                >
                  Export Scoring
                </a>
              </li>
              <MenuItem onSelect={toggleEnableBack}>
                {_.result(assessment, 'enable_back') ? 'Disable Back Button' : 'Enable Back Button'}
              </MenuItem>
              <MenuItem onSelect={toggleEnableProgress}>
                {_.result(assessment, 'enable_progress') ? 'Disable Progress Bar' : 'Enable Progress Bar'}
              </MenuItem>
              {_.has(extra, 'timer') ? (
                <MenuItem onSelect={this.removeTimer}>Remove Timer</MenuItem>
              ) : (
                <MenuItem onSelect={this.addTimer}>Add Timer</MenuItem>
              )}
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
