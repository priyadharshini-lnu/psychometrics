import {
  FC, useEffect, useState,
} from 'react'
import {
  useGlintToken,
  Button, Dropdown, Flex, Modal, Skeleton, Space,
} from '@thetalententerprise/glint'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  fetchSingle as fetchReport,
  getCurrent,
  getExternalReport,
  fetchExternalReportDetails,
} from '~/modules/admin/modules/AssessorApp/core/userReports'
import { LangDropdown } from '~/components/LangDropdown'
import PDFViewer from '~/components/PDFViewer'
import Report from '~/modules/reports/report'
import { useReportDimensions } from '~/hooks/useReportDimensions'
import styles from './Reports.less'

const { I18n } = window

const connector = connect((state: RootState) => ({
  userReport: getCurrent(state),
  externalReport: getExternalReport(state),
}), {
  fetchReport,
  fetchExternalReportDetails,
})

interface OwnProps {
  reportId: number
  campaignId: number
  isExternal: boolean
  reportName: string
  onClose: () => void
}

interface Props extends ConnectedProps<typeof connector>, OwnProps {}

const ReportViewModalComponent: FC<Props> = ({
  reportId,
  campaignId,
  isExternal,
  reportName,
  onClose,
  userReport,
  externalReport,
  fetchReport,
  fetchExternalReportDetails,
}) => {
  const { campaignId: paramCampaignId } = useParams<{ campaignId?: string }>()
  const resolvedCampaignId = campaignId || parseInt(paramCampaignId!, 10)
  const [selectedLocale, setSelectedLocale] = useState<string | null>(null)
  const [skipLogic, setSkipLogic] = useState(false)
  const token = useGlintToken()

  const {
    containerRef, reportRef, reportSize,
  } = useReportDimensions()

  const defaultLocale = userReport?.report?.default_language?.code
  const effectiveLocale = selectedLocale || defaultLocale

  useEffect(() => {
    setSelectedLocale(null)
    setSkipLogic(false)
  }, [reportId])

  useEffect(() => {
    if (isExternal) {
      fetchExternalReportDetails(resolvedCampaignId, reportId)
    } else {
      const reportParams = selectedLocale !== null ? { reportLang: selectedLocale } : {}
      fetchReport(resolvedCampaignId, reportId, reportParams)
    }
  }, [
    isExternal,
    resolvedCampaignId,
    reportId,
    selectedLocale,
  ])

  const handleLocaleChange = (locale: string) => {
    setSelectedLocale(locale)
  }

  const onChangeView = ({ key }: { key: string }) => {
    setSkipLogic(key === 'all')
  }

  const isExternalLoaded = Boolean(externalReport?.id) && externalReport.id === reportId
  const isInternalLoaded = Boolean(userReport?.loaded)
  const isLoaded = isExternal ? isExternalLoaded : isInternalLoaded
  const pdfUrl = isExternal
    ? externalReport?.pdfUrl
    : (userReport as unknown as Record<string, { url?: string }>)?.pdf?.url

  // Toolbar controls — only shown for internal HTML reports
  const renderHeaderControls = () => {
    if (isExternal || !isLoaded || !userReport?.report) return null

    const { report: { default_language: defaultLanguage } } = userReport

    return (
      <Flex align="center" gap={8}>
        <Dropdown
          menu={{
            items: [
              { key: 'subject', label: I18n.t('common.text.subject') },
              { key: 'all', label: I18n.t('common.text.all_pages') },
            ],
            onClick: onChangeView,
          }}
        >
          <Button>
            <Space>
              {I18n.t('common.text.view_as')}
              {skipLogic ? I18n.t('common.text.all_pages') : I18n.t('common.text.subject')}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
        <LangDropdown
          locales={userReport.report.available_languages.map(locale => locale.code)}
          currentLocale={effectiveLocale || defaultLanguage.code}
          onChange={handleLocaleChange}
          useLoading={false}
        />
      </Flex>
    )
  }

  const renderBody = () => {
    if (!isLoaded) {
      return (
        <Flex vertical className={styles.modalBody} style={{ background: token.colorBgLayout }}>
          <Skeleton active paragraph={{ rows: 15 }} className={styles.modalBodyInner} />
        </Flex>
      )
    }

    if (isExternal) {
      if (!pdfUrl) {
        return (
          <Flex vertical className={styles.modalBody} style={{ background: token.colorBgLayout }}>
            <div className={styles.modalBodyInner}>
              <p>{I18n.t('admin.report_pdf_unavailable')}</p>
            </div>
          </Flex>
        )
      }

      return (
        <Flex vertical className={styles.modalBody} style={{ background: token.colorBgLayout }}>
          <PDFViewer fileUrl={pdfUrl} />
        </Flex>
      )
    }

    const {
      report: { default_language: defaultLanguage, locales },
      report,
      results,
      user,
    } = userReport

    return (
      <Flex vertical className={styles.modalBody} style={{ background: token.colorBgLayout }}>
        <Flex justify="center" className={styles.htmlReportWrapper}>
          <div ref={containerRef} className={styles.reportOuter} style={{ height: reportSize.height || 'auto' }}>
            <div ref={reportRef}>
              <Report
                data={report}
                results={results}
                campaign={JSON.stringify({})}
                user={JSON.stringify(user)}
                locales={locales}
                selectedLocale={defaultLanguage}
                userReport={userReport}
                skipLogic={skipLogic}
              />
            </div>
          </div>
        </Flex>
      </Flex>
    )
  }

  return (
    <Modal
      open
      onCancel={onClose}
      width="90%"
      footer={(
        <Button onClick={onClose}>
          {I18n.t('shared.close')}
        </Button>
      )}
      title={(
        <Flex align="center" justify="space-between">
          {reportName}
          {' '}
          <Flex align="center" gap={8}>
            {renderHeaderControls()}
          </Flex>
        </Flex>
      )}
      closable={false}
      destroyOnHidden
    >
      {renderBody()}
    </Modal>
  )
}

export default connector(ReportViewModalComponent)
