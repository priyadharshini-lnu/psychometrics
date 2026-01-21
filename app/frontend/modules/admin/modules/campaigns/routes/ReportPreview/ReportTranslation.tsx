import { useEffect, useRef, useState } from 'react'
import {
  Modal, Button, Row, Col, Spin, Space, Select, Flex, Divider, Affix,
} from 'antd'
import { useLocation, useParams } from 'react-router-dom'
import Report from '~/modules/reports/report'
import {
  ApprovalStatuses, AsyncTranslation, AsyncTranslationTR,
} from '~/modules/admin/modules/campaigns/core/userReports'
import { PropsFromRedux } from './connect'
import { isRtl } from '~/utils/locales'
import { AIEditorIcon } from '~/glint/icons/AIEditorIcon'
import { ArrowRightOutlined, InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'

import styles from './styles.less'

const { I18n } = window

type Params = {
  projectId: string
  campaignId: string
  id: string
}

type Props = {
  userReport: PropsFromRedux['userReport']
  availableLanguages: string[]
  show: boolean
  onClose: () => void
}

export default function ReportTranslation ({
  userReport,
  availableLanguages,
  show,
  onClose,
}: Props) {
  const reportContainer = useRef<HTMLDivElement | null>(null)
  const [aiLang, setAiLang] = useState(null)
  const [detectedLanguage, setDetectedLanguage] = useState(null)
  const [aiTranslationLang, setAiTranslationLang] = useState(null)
  const [showOriginalLang, setShowOriginalLang] = useState(false)
  const [originalTranslation, setOriginalTranslations] = useState<{} | null>(null)
  const [aiTranslations, setAiTranslations] = useState<{}>({})
  const [error, setError] = useState<string | null>(null)

  const location = useLocation()
  const {
    campaignId,
    id,
  } = useParams() as Params
  const params = new URLSearchParams(location.search)

  const skipLogic = params.get('skip_logic') === 'true'

  const lang = new URLSearchParams(location.search).get('report_lang') || userReport.report.default_language?.code

  const reportIsLoaded = (): boolean | undefined => (userReport && userReport.loaded)

  const changeAiLang = (lang) => {
    setAiLang(lang)
  }

  useEffect(() => {
    if (!show) {
      setAiLang(null)
      setAiTranslationLang(null)
    }
  }, [show])

  const { makeAsyncRequest: translateRequest, asyncLoading: translationInProgress } = useAsyncRequestResponse<
    AsyncTranslation
  >({
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}/translate`,
    responseType: AsyncTranslationTR,
  })

  const aiTranslate = async () => {
    if (!aiLang) { return }
    if (!reportContainer.current) { return }
    setError(null)

    let texts = {}
    if (!originalTranslation) {
      const modules = reportContainer.current.querySelectorAll('[data-ai-translatable="true"]')
      texts = Array.from(modules).reduce((acc, module) => {
        const texts = module.querySelectorAll('[data-ai-translation]')
        const moduleId = module.getAttribute('data-module-id') as string
        if (texts.length > 0) {
          acc[moduleId] = Array.from(texts).reduce((acc, text) => {
            const key = text.getAttribute('data-ai-translation')
            if (key) {
              acc[key] = (text as HTMLElement).innerHTML
            }
            return acc
          }, {})
        }
        return acc
      }, {})
      setOriginalTranslations(texts)
    } else {
      texts = originalTranslation
    }

    if (!aiTranslations[aiLang]) {
      try {
        const result = await translateRequest({ texts, lang: aiLang })
        if (result.processingStatus === 'completed') {
          const { translations, detectedLang, error } = result.responseData
          if (error) {
            setError(error.message)
          } else {
            setAiTranslations({ ...aiTranslations, [aiLang]: translations })
            setDetectedLanguage(detectedLang)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    setAiTranslationLang(aiLang)
  }

  const renderReportPreview = () => {
    if (!reportIsLoaded()) {
      return null
    }

    const {
      report: {
        default_language: defaultLanguage,
        locales,
      },
      report,
      results,
      user,
      campaign,
    } = userReport

    const selectedLanguage = lang ? {
      code: lang,
      direction: isRtl(lang) ? 'rtl' : 'ltr',
    } : defaultLanguage

    return (
      <Report
        data={report}
        results={results}
        campaign={JSON.stringify(campaign)}
        user={JSON.stringify(user)}
        locales={locales}
        selectedLocale={selectedLanguage}
        userReport={userReport}
        allowEdit={userReport.approvalStatus === ApprovalStatuses.QCInProgress
          && userReport.permissions.editQc}
        allowApprove={userReport.approvalStatus === ApprovalStatuses.QCCompleted
          && userReport.permissions.manageApproval}
        skipLogic={skipLogic}
        aiTranslations={showOriginalLang ? null : aiTranslations[aiTranslationLang || '']}
      />
    )
  }
  return (
    <Modal
      destroyOnHidden
      open={show}
      width="99%"
      onCancel={onClose}
      footer={null}
      style={{ top: 20 }}
      styles={{
        mask: {
          zIndex: 99999,
        },
        container: {
          zIndex: 99999,
          borderRadius: 8,
          overflow: 'hidden',
        },
        body: {
          zIndex: 99999,
          overflowY: 'scroll',
          overflowX: 'hidden',
          maxHeight: '85vh',
        },
      }}
      title={(
        <Flex className={styles.translationHeader} align="center" style={{ width: '100%' }}>
          <Space>
            <AIEditorIcon />
            <span>{I18n.t('admin.translate_with_ai')}</span>
            {!reportIsLoaded() && <Spin />}
          </Space>
          <Flex vertical flex={1} align="center" gap={10}>
            <Flex flex={1} justify="center" align="center">
              <Space>
                {aiTranslationLang && detectedLanguage && (
                  <Space className={styles.translationInfo}>
                    {I18n.t('admin.translated_from')}
                    <strong>{detectedLanguage}</strong>
                    <ArrowRightOutlined />
                    <strong>{I18n.t(`languages.${aiTranslationLang}`)}</strong>

                    <Divider orientation="vertical" />
                    <Button onClick={() => setShowOriginalLang(!showOriginalLang)}>
                      {showOriginalLang ? I18n.t('admin.show_translated') : I18n.t('admin.show_original')}
                    </Button>
                  </Space>
                )}

                <Divider orientation="vertical" />

                <div className={styles.translationControls}>
                  <Space style={{ width: '100%' }}>
                    {`${I18n.t('admin.translate_to')}:`}
                    <Select
                      showSearch
                      style={{ width: '180px' }}
                      placeholder="Select Language"
                      onChange={changeAiLang}
                      value={aiLang}
                    >
                      {availableLanguages.map(lang => (
                        <Select.Option value={lang}>
                          {I18n.t(`languages.${lang}`)}
                        </Select.Option>
                      ))}
                    </Select>
                    <Flex justify="flex-end">
                      <Button type="primary" disabled={!aiLang} onClick={aiTranslate} loading={translationInProgress}>
                        <AIEditorIcon />
                        {I18n.t('admin.translate')}
                      </Button>
                    </Flex>
                  </Space>
                </div>
              </Space>
            </Flex>
            <div className={styles.errorContainer}>
              {error}
            </div>
          </Flex>
        </Flex>
      )}
    >
      <Row justify="center" gutter={30}>
        <Col>
          <div className="reportContainer" ref={reportContainer}>
            {renderReportPreview()}
          </div>
          {aiLang && aiTranslations[aiLang] && (
            <Affix offsetBottom={34} rootClassName={styles.aiBadge} style={{ zIndex: 99999 }}>
              <div className={styles.aiBadgeContent}>
                <Space>
                  <InfoCircleOutlined />
                  {I18n.t('admin.ai_notice')}
                </Space>
              </div>
            </Affix>
          )}
        </Col>
      </Row>
    </Modal>
  )
}
