import { Component } from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { Button, Space } from 'antd'
import {
  EyeOutlined, SaveOutlined, PartitionOutlined, ClockCircleOutlined, SettingOutlined,
} from '@ant-design/icons'
import _ from 'lodash'
import moment from 'moment'
import cs from 'classnames'
import ActionsHistory from '~/modules/survey/components/ActionsHistory'
import Block from '~/modules/survey/models/Block'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import { perform } from '~/modules/survey/core/temp/socket'
import NotificationDispatcher from '~/modules/survey/dispatchers/NotificationDispatcher'
import SerializeAssessment from '~/modules/survey/core/builder/assessment/SerializeAssessment'
import styles from './Header.less'
import { Tabs } from './Tabs'

const { I18n } = window

export class Header extends Component {
  openDataSheetModal = () => {
    const { openDataSheetModal, assessment } = this.props
    openDataSheetModal({ columns: assessment.data_sheet_columns, id: assessment.id })
  }

  openSettings = () => {
    const { openSettings } = this.props
    openSettings()
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
      instructions: { 0: { content: instructions.content } },
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
      assessment, assessment: { extra, saving },
    } = this.props
    const isAssessmentTimerAdded = extra && Object.prototype.hasOwnProperty.call(extra, 'timer')

    return (
      <div className={`panel-heading ${styles.menu}`}>
        <Space>
          <h3 className="panel-title">
            {assessment.name}
          </h3>
          <Button type="primary" onClick={this.openPreview}>
            <EyeOutlined />
            {' '}
            {I18n.t('administration.assessments.preview')}
          </Button>
          {isAssessmentTimerAdded && (
          <Space>
            <ClockCircleOutlined size={24} />
            {moment.utc(extra.timer * 1000).format('HH:mm:ss')}
          </Space>
          )}
        </Space>

        <ul className={cs('panel-controls', styles.controls)}>
          {assessment && (
            <li>
              <div>
                <Button
                  href={`/administration/reports?q[assessment_id_in][]=${assessment.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {I18n.t('administration.assessments.reports')}
                </Button>
              </div>
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
              <MenuItem onSelect={this.openSettings}>
                <Space>
                  <SettingOutlined />
                  Settings...
                </Space>
              </MenuItem>
              <MenuItem onSelect={this.showMappingNorms}>
                <Space>
                  <PartitionOutlined />
                  {I18n.t('administration.assessments.map_norms')}
                </Space>
              </MenuItem>
              <MenuItem onSelect={this.openFlow}>
                <i className="fa fa-random" />
                {I18n.t('administration.assessments.flow')}
              </MenuItem>
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
            <Tabs active="questions" />
          </li>
          <li>
            <Button type="primary" onClick={this.save} disabled={saving}>
              <SaveOutlined />
              {' '}
              {I18n.t('administration.save')}
            </Button>
          </li>
        </ul>
      </div>
    )
  }
}

export default Header
