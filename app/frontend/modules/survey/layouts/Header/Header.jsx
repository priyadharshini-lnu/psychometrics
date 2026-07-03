import { useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Button, Space, Dropdown, Select, Alert, Tag, notification,
} from 'antd'
import _ from 'lodash'
import cs from 'classnames'
import {
  EyeOutlined, SaveOutlined, PartitionOutlined, ClockCircleOutlined, SettingOutlined, DownOutlined,
  TranslationOutlined, PlusOutlined, CopyOutlined, TableOutlined, ImportOutlined, EditOutlined, ExportOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { secondsToDayHoursAndMinutes } from '~/utils/time'
import Block from '~/modules/survey/models/Block'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import { perform } from '~/modules/survey/core/temp/socket'
import NotificationDispatcher from '~/modules/survey/dispatchers/NotificationDispatcher'
import styles from './Header.less'
import { Tabs } from './Tabs'

const { I18n } = window

const Header = (props) => {
  const previewDataRef = useRef(null)
  const previewFormRef = useRef(null)
  const translationExportDataRef = useRef(null)
  const translationExportFormRef = useRef(null)
  const navigate = useNavigate()
  const { id } = useParams()
  const [params] = useSearchParams()
  const { availableLocales } = I18n

  const currentLocale = params.get('assessmentLang') || 'en'

  const {
    blocksWithQuestions, instructions, openCampaignFactorsModal,
    saveAssessment, builder, openMapNorms, openCreateByTemplate,
    openDataSheetModal, openImportQuestionsModal, openSettings, openFlow, createBlock,
    exportQuestions,
    assessment, assessment: {
      extra, saving, defaultLanguage, translations_migrated, category,
    },
  } = props

  const showAssessmentOptions = defaultLanguage === currentLocale

  const isAssessmentTimerAdded = extra && Object.prototype.hasOwnProperty.call(extra, 'timer')
  const isThreesixtyAssessment = category === 'threesixty'

  const handleOpenDataSheetModal = () => {
    openDataSheetModal({ columns: assessment.data_sheet_columns, id: assessment.id })
  }

  const handleOpenImportQuestionsModal = () => {
    openImportQuestionsModal({ assessmentId: assessment.id })
  }

  const handleOpenSettings = () => {
    openSettings()
  }

  const handleOpenFlow = () => {
    openFlow({ flow: assessment.flow })
  }

  const handleCreateBlock = (blockType) => {
    createBlock(new Block({ blockType: blockType || 'regular' }))
  }

  const openSearchPopup = () => {
    openCreateByTemplate({ entityName: 'Block' })
  }

  const showMappingNorms = () => {
    perform('assessment_norms', { without_notification: true }, (data) => {
      openMapNorms({ data })
    })
  }

  const addBlockMenuProps = isThreesixtyAssessment ? {
    children: [
      {
        key: 'regular',
        label: I18n.t('administration.survey_builder.models.block_types.regular'),
        onClick: () => handleCreateBlock('regular'),
      },
      {
        key: 'skill_rater',
        label: I18n.t('administration.survey_builder.models.block_types.skill_rater'),
        onClick: () => handleCreateBlock('skill_rater'),
      },
    ],
  } : {
    onClick: () => handleCreateBlock(),
  }

  const exportTranslations = () => {
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
    if (translationExportDataRef.current) {
      translationExportDataRef.current.value = JSON.stringify(result)
    }
    translationExportFormRef.current?.submit()
  }

  const openPreview = () => {
    previewFormRef.current?.submit()
  }

  const save = () => {
    saveAssessment(builder, currentLocale).then(() => {
      NotificationDispatcher.notify({ message: 'Assessment successfully saved' })
    }).catch((error) => {
      const errorMessage = error?.[0] || 'Something went wrong. Contact your administrator.'
      notification.error({
        message: errorMessage, placement: 'top', duration: 10, style: { minWidth: '500px' },
      })
    })
  }

  const openCampaignFactors = () => {
    openCampaignFactorsModal({ assessmentId: assessment.id })
  }

  const changeLocale = (value) => {
    navigate(`/administration/assessments/${id}?assessmentLang=${value}`)
  }

  const handleQuestionsExport = () => {
    exportQuestions(assessment.id).then(() => {
      NotificationDispatcher.notify({ message: I18n.t('administration.assessments.export_questions_toastr') })
    })
  }


  return (
    <Space orientation="vertical" className="w-100">
      {translations_migrated ? (
        <Space className="w-100 justify-end pe-3">
          {!showAssessmentOptions ? (
            <Alert
              showIcon
              className="pt-1 pb-1 mt-3 ms-3"
              type="warning"
              message="Some of the options are not available since you are not editing in default language."
            />
          ) : null}
          <Select
            showSearch
            filterOption={(inputValue, option) => option.key.toLowerCase().includes(inputValue.toLowerCase())}
            style={{ width: '200px' }}
            value={currentLocale}
            className="mt-3 ms-3"
            onChange={changeLocale}
          >
            {availableLocales?.map(locale => (
              <Select.Option key={`${locale} ${I18n.t(`languages.${locale}`)}`} value={locale}>
                {I18n.t(`languages.${locale}`)}
                {locale === defaultLanguage ? <Tag className="ms-2" color="success">Default</Tag> : null}
              </Select.Option>
            ))}
          </Select>
        </Space>
      ) : null}
      <div className={`panel-heading ${styles.menu}`}>
        <Space>
          <h3 className="panel-title">
            {assessment.name}
          </h3>
          <Button type="primary" onClick={openPreview}>
            <EyeOutlined />
            {' '}
            {I18n.t('administration.assessments.preview')}
          </Button>
          {isAssessmentTimerAdded && (
            <Space>
              <ClockCircleOutlined size={24} />
              {secondsToDayHoursAndMinutes(extra.timer)}
            </Space>
          )}
        </Space>
        <form
          style={{ display: 'none' }}
          ref={previewFormRef}
          target="_blank"
          action={`${location.pathname}/preview?assessmentLang=${currentLocale}`}
          method="POST"
        >
          <input
            name="authenticity_token"
            type="hidden"
            value={document.querySelector('meta[name="csrf-token"]').getAttribute('content')}
          />
          <input name="data" ref={previewDataRef} />
        </form>

        <ul className={cs('panel-controls', styles.controls)}>
          {showAssessmentOptions ? (
            <>
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
              <li>
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      {
                        key: 'settings',
                        icon: <SettingOutlined />,
                        label: 'Settings...',
                        onClick: handleOpenSettings,
                      },
                      {
                        key: 'mappgin-norm',
                        icon: <PartitionOutlined />,
                        label: I18n.t('administration.assessments.map_norms'),
                        onClick: showMappingNorms,
                      },
                      {
                        key: 'flow',
                        icon: <i className="fa fa-random" />,
                        label: I18n.t('administration.assessments.flow'),
                        onClick: handleOpenFlow,
                      },
                      {
                        key: 'add-block',
                        icon: <PlusOutlined />,
                        label: 'Add Block',
                        ...addBlockMenuProps,
                      },
                      {
                        key: 'copy-block',
                        icon: <CopyOutlined />,
                        label: 'Copy Block From...',
                        onClick: openSearchPopup,
                      },
                      {
                        key: 'export-translations',
                        icon: <TranslationOutlined />,
                        label: 'Export Translations',
                        onClick: exportTranslations,
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
                        onClick: handleOpenDataSheetModal,
                      },
                      {
                        key: 'improt-questions',
                        icon: <ImportOutlined />,
                        label: I18n.t('administration.assessments.menu.import_questions'),
                        onClick: handleOpenImportQuestionsModal,
                      },
                      {
                        key: 'export-questions',
                        icon: <ExportOutlined />,
                        label: I18n.t('administration.assessments.menu.export_questions'),
                        onClick: handleQuestionsExport,
                      },
                      {
                        key: 'campaign-factors',
                        icon: <EditOutlined />,
                        label: I18n.t('administration.assessments.menu.managage_campaign_factors'),
                        onClick: openCampaignFactors,
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
                  ref={translationExportFormRef}
                  action={`/administration/translations/assessments/${_.result(assessment, 'id')}/export`}
                  method="POST"
                >
                  <input
                    name="authenticity_token"
                    type="hidden"
                    value={document.querySelector('meta[name="csrf-token"]').getAttribute('content')}
                  />
                  <input name="data" ref={translationExportDataRef} />
                </form>

              </li>
              <li>
                <Tabs active="questions" />
              </li>
            </>
          ) : null}

          <li>
            <Button type="primary" onClick={save} disabled={saving}>
              <SaveOutlined />
              {' '}
              {I18n.t('administration.save')}
            </Button>
          </li>
        </ul>
      </div>
    </Space>
  )
}

export default Header
