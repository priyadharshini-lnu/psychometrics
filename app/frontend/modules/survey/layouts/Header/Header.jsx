import { Component } from 'react'
import { Button, Space, Dropdown } from 'antd'
import {
  EyeOutlined, SaveOutlined, PartitionOutlined, ClockCircleOutlined, SettingOutlined, DownOutlined,
  TranslationOutlined, PlusOutlined, CopyOutlined, TableOutlined, ImportOutlined, EditOutlined,
} from '@ant-design/icons'
import _ from 'lodash'
import cs from 'classnames'
import dayjs from '~/utils/dayjs'
import Block from '~/modules/survey/models/Block'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import { perform } from '~/modules/survey/core/temp/socket'
import NotificationDispatcher from '~/modules/survey/dispatchers/NotificationDispatcher'
import styles from './Header.less'
import { Tabs } from './Tabs'

const { I18n } = window

export class Header extends Component {
  openDataSheetModal = () => {
    const { openDataSheetModal, assessment } = this.props
    openDataSheetModal({ columns: assessment.data_sheet_columns, id: assessment.id })
  }

  openImportQuestionsModal = () => {
    const { openImportQuestionsModal, assessment } = this.props
    openImportQuestionsModal({ assessmentId: assessment.id })
  }

  openSettings = () => {
    const { openSettings } = this.props
    openSettings()
  }

  openFlow = () => {
    const { openFlow, assessment } = this.props
    openFlow({ flow: assessment.flow })
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
    const timer = time && dayjs.duration({
      hours: time.hour(),
      minutes: time.minute(),
      seconds: time.second(),
    }).asSeconds()
    updateExtra({ ...extra, timer })
  }

  openPreview = () => {
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

  openCampaignFactors = () => {
    const { openCampaignFactorsModal, assessment } = this.props
    openCampaignFactorsModal({ assessmentId: assessment.id })
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
            {dayjs.utc(extra.timer * 1000).format('HH:mm:ss')}
          </Space>
          )}
        </Space>

        <ul className={cs('panel-controls', styles.controls)}>
          {assessment && (
            <li>
              <div>
                <Button
                  href={`/admin/reports/active?filter[assessments_id_in]=${assessment.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {I18n.t('administration.assessments.reports')}
                </Button>
              </div>
            </li>
          )}
          {/* <li className={styles.spaceLeft}><ActionsHistory /></li> */}
          <li>
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  {
                    key: 'settings',
                    icon: <SettingOutlined />,
                    label: 'Settings...',
                    onClick: this.openSettings,
                  },
                  {
                    key: 'mappgin-norm',
                    icon: <PartitionOutlined />,
                    label: I18n.t('administration.assessments.map_norms'),
                    onClick: this.showMappingNorms,
                  },
                  {
                    key: 'flow',
                    icon: <i className="fa fa-random" />,
                    label: I18n.t('administration.assessments.flow'),
                    onClick: this.openFlow,
                  },
                  {
                    key: 'add-block',
                    icon: <PlusOutlined />,
                    label: 'Add Block',
                    onClick: this.createBlock,
                  },
                  {
                    key: 'copy-block',
                    icon: <CopyOutlined />,
                    label: 'Copy Block From...',
                    onClick: this.openSearchPopup,
                  },
                  {
                    key: 'export-translations',
                    icon: <TranslationOutlined />,
                    label: 'Export Translations',
                    onClick: this.export,
                  },
                  {
                    key: 'import-translations',
                    icon: <TranslationOutlined />,
                    label: (
                      <a
                        className={styles.linkExport}
                        data-remote="true"
                        href={`/administration/translations/assessments/${_.result(assessment, 'id')}/new`}
                      >
                        Import Translations
                      </a>
                    ),
                  },
                  {
                    key: 'manage-datasheet',
                    icon: <TableOutlined />,
                    label: 'Manage Datasheet',
                    onClick: this.openDataSheetModal,
                  },
                  {
                    key: 'improt-questions',
                    icon: <ImportOutlined />,
                    label: I18n.t('administration.assessments.menu.import_questions'),
                    onClick: this.openImportQuestionsModal,
                  },
                  {
                    key: 'campaign-factors',
                    icon: <EditOutlined />,
                    label: I18n.t('administration.assessments.menu.managage_campaign_factors'),
                    onClick: this.openCampaignFactors,
                  },
                ],
              }}
            >
              <Button>
                <Space>
                  <SettingOutlined />
                  Options
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
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
