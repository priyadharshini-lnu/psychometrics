import {
  FC, useState, useMemo,
} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Steps, Card, Button, Flex, Typography, message, Grid,
} from 'antd'
import { LeftOutlined, CheckCircleFilled, DownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import CampaignSelectionStep from './steps/CampaignSelectionStep'
import { LocalCampaign } from './types'
import ReportSelectionStep from './steps/ReportSelectionStep'
import DateRangeStep from './steps/DateRangeStep'
import LanguageSelectionStep from './steps/LanguageSelectionStep'
import ReviewStep from './steps/ReviewStep'
import {
  buildSubmitPayload,
  deriveSelectedReports,
  formatCampaignCount,
  formatLanguagesProgress,
  formatLanguagesSetForAll,
  formatReportCount,
  getResourceErrorMessage,
  BulkReportState,
  initialBulkReportState,
} from './core'

const { Title, Text } = Typography
const { useBreakpoint } = Grid
const { I18n } = window

const STEPS = [
  { key: 'campaigns', title: I18n.t('admin.campaigns') },
  { key: 'reports', title: I18n.t('admin.reports') },
  { key: 'date_range', title: I18n.t('admin.date_range') },
  { key: 'languages', title: I18n.t('shared.languages') },
  { key: 'review', title: I18n.t('shared.review') },
]

const summaryRowStyle: React.CSSProperties = {
  padding: '11px 0',
  borderTop: '1px solid var(--ant-color-split)',
}

const GenerateExport: FC = () => {
  const { projectId } = useParams() as { projectId: string }
  const navigate = useNavigate()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const [currentStep, setCurrentStep] = useState(0)
  const [formState, setFormState] = useState<BulkReportState>(initialBulkReportState)
  const parsedProjectId = parseInt(projectId, 10)
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const { collectionAction } = useResources('bulk_report_jobs', {
    basePath: `projects/${projectId}`,
  })

  const derivedReports = useMemo(
    () => deriveSelectedReports(formState.selectedCampaigns, formState.selectedReportIds),
    [formState.selectedCampaigns, formState.selectedReportIds],
  )

  const stepValid = (step: number): boolean => {
    if (step === 0) return formState.selectedCampaignIds.size > 0
    if (step === 1) return formState.selectedReportIds.size > 0
    if (step === 2) {
      const { startDate, endDate } = formState
      return !!startDate && !!endDate && startDate <= endDate
    }
    if (step === 3) {
      const { selectedReportIds, reportLanguages } = formState
      return selectedReportIds.size > 0
        && [...selectedReportIds].every(id => (reportLanguages[id]?.size ?? 0) > 0)
    }
    if (step === 4) {
      return stepValid(0) && stepValid(1) && stepValid(2) && stepValid(3)
    }
    return false
  }

  const handleNext = () => {
    if (stepValid(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!allStepsValid || submitState === 'submitting') return

    setSubmitState('submitting')

    try {
      await collectionAction({
        action: 'bulk_download',
        method: 'post',
        body: buildSubmitPayload(formState),
      })
      setSubmitState('success')
      message.success(I18n.t('admin.bulk_reports_submit_success'))
      navigate(`/admin/projects/${projectId}/bulk_reports`)
    } catch (error) {
      setSubmitState('error')
      message.error(getResourceErrorMessage(error) || I18n.t('admin.bulk_reports_submit_error'))
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CampaignSelectionStep
            projectId={parsedProjectId}
            selectedCampaignIds={formState.selectedCampaignIds}
            onSelectionChange={(ids, visibleCampaigns) => {
              setFormState((prev) => {
                const existing: Record<string, LocalCampaign> = {}
                prev.selectedCampaigns.forEach((c) => { existing[String(c.id)] = c })
                visibleCampaigns.forEach((c) => { existing[String(c.id)] = c })
                const merged = Object.values(existing).filter(c => ids.has(String(c.id)))
                return {
                  ...prev,
                  selectedCampaignIds: ids,
                  selectedCampaigns: merged,
                  selectedReportIds: new Set(),
                  reportLanguages: {},
                }
              })
            }}
          />
        )
      case 1:
        return (
          <ReportSelectionStep
            selectedCampaigns={formState.selectedCampaigns}
            selectedReportIds={formState.selectedReportIds}
            totalSelectedCampaigns={formState.selectedCampaignIds.size}
            onSelectionChange={(ids) => {
              setFormState(prev => ({
                ...prev,
                selectedReportIds: ids,
                reportLanguages: {},
              }))
            }}
          />
        )
      case 2:
        return (
          <DateRangeStep
            startDate={formState.startDate}
            endDate={formState.endDate}
            onDateChange={(startDate, endDate) => {
              setFormState(prev => ({ ...prev, startDate, endDate }))
            }}
          />
        )
      case 3:
        return (
          <LanguageSelectionStep
            reports={derivedReports}
            reportLanguages={formState.reportLanguages}
            onLanguageChange={(reportLanguages) => {
              setFormState(prev => ({ ...prev, reportLanguages }))
            }}
          />
        )
      case 4:
        return (
          <ReviewStep
            selectedCampaigns={formState.selectedCampaigns}
            selectedReportIds={formState.selectedReportIds}
            startDate={formState.startDate}
            endDate={formState.endDate}
            reportLanguages={formState.reportLanguages}
            includeInactiveUsers={formState.includeInactiveUsers}
            onIncludeInactiveUsersChange={(val) => {
              setFormState(prev => ({ ...prev, includeInactiveUsers: val }))
            }}
          />
        )
      default:
        return (
          <Flex justify="center" align="middle" style={{ padding: 40 }}>
            <Text type="secondary">{I18n.t('admin.bulk_reports_step_coming_soon')}</Text>
          </Flex>
        )
    }
  }

  const selectedCampaignCount = formState.selectedCampaignIds.size
  const selectedReportCount = formState.selectedReportIds.size
  const { startDate, endDate } = formState
  const dateRangeSet = !!startDate && !!endDate && startDate <= endDate
  const dateRangeLabel = dateRangeSet ? `${startDate} → ${endDate}` : I18n.t('shared.not_set')

  const totalReportsWithLangs = [...formState.selectedReportIds].filter(
    id => (formState.reportLanguages[id]?.size ?? 0) > 0,
  ).length
  const langsDone = selectedReportCount > 0 && totalReportsWithLangs === selectedReportCount
  let langsLabel: string
  if (selectedReportCount === 0) {
    langsLabel = I18n.t('admin.bulk_reports_none_selected')
  } else if (langsDone) {
    langsLabel = formatLanguagesSetForAll(selectedReportCount)
  } else {
    langsLabel = formatLanguagesProgress(totalReportsWithLangs, selectedReportCount)
  }

  const allStepsValid = stepValid(0) && stepValid(1) && stepValid(2) && stepValid(3)

  const getSubmitStatusText = () => {
    if (submitState === 'submitting') return I18n.t('admin.bulk_reports_queuing_jobs')
    if (submitState === 'success') return I18n.t('admin.bulk_reports_download_notification_sent')
    if (submitState === 'error') return I18n.t('admin.bulk_reports_error_try_again')
    return allStepsValid
      ? I18n.t('admin.bulk_reports_ready_to_generate')
      : I18n.t('admin.bulk_reports_complete_every_step')
  }

  const summaryCard = (
    <Card
      style={{
        width: isMobile ? '100%' : 300,
        flexShrink: 0,
        position: isMobile ? 'static' : 'sticky',
        top: 16,
      }}
      styles={{ body: { padding: 20 } }}
    >
      <Title level={5} style={{ margin: '0 0 4px' }}>{I18n.t('admin.bulk_reports_summary_title')}</Title>
      <Text type="secondary" style={{ fontSize: 12 }}>{I18n.t('admin.bulk_reports_summary_description')}</Text>

      <div style={{ marginTop: 16 }}>
        <Flex justify="space-between" align="center" style={summaryRowStyle}>
          <Flex align="center" gap={8}>
            <CheckCircleFilled style={{
              fontSize: 16,
              color: selectedCampaignCount > 0 ? 'var(--ant-color-primary)' : 'var(--ant-color-text-quaternary)',
            }}
            />
            <Text type="secondary">{I18n.t('admin.campaigns')}</Text>
          </Flex>
          <Text strong={selectedCampaignCount > 0} type={selectedCampaignCount > 0 ? undefined : 'secondary'}>
            {selectedCampaignCount > 0
              ? formatCampaignCount(selectedCampaignCount)
              : I18n.t('admin.bulk_reports_none_selected')}
          </Text>
        </Flex>

        <Flex justify="space-between" align="center" style={summaryRowStyle}>
          <Flex align="center" gap={8}>
            <CheckCircleFilled style={{
              fontSize: 16,
              color: selectedReportCount > 0 ? 'var(--ant-color-primary)' : 'var(--ant-color-text-quaternary)',
            }}
            />
            <Text type="secondary">{I18n.t('admin.reports')}</Text>
          </Flex>
          <Text strong={selectedReportCount > 0} type={selectedReportCount > 0 ? undefined : 'secondary'}>
            {selectedReportCount > 0
              ? formatReportCount(selectedReportCount)
              : I18n.t('admin.bulk_reports_none_selected')}
          </Text>
        </Flex>

        <Flex justify="space-between" align="center" style={summaryRowStyle}>
          <Flex align="center" gap={8}>
            <CheckCircleFilled style={{
              fontSize: 16,
              color: dateRangeSet ? 'var(--ant-color-primary)' : 'var(--ant-color-text-quaternary)',
            }}
            />
            <Text type="secondary">{I18n.t('admin.date_range')}</Text>
          </Flex>
          <Text
            strong={dateRangeSet}
            type={dateRangeSet ? undefined : 'secondary'}
            style={{
              fontFamily: dateRangeSet ? 'monospace' : undefined,
              fontSize: 13,
              textAlign: 'right',
              maxWidth: 160,
            }}
          >
            {dateRangeLabel}
          </Text>
        </Flex>

        <Flex justify="space-between" align="center" style={summaryRowStyle}>
          <Flex align="center" gap={8}>
            <CheckCircleFilled style={{
              fontSize: 16,
              color: langsDone ? 'var(--ant-color-primary)' : 'var(--ant-color-text-quaternary)',
            }}
            />
            <Text type="secondary">{I18n.t('shared.languages')}</Text>
          </Flex>
          <Text
            strong={langsDone}
            type={langsDone ? undefined : 'secondary'}
            style={{ textAlign: 'right', maxWidth: 160 }}
          >
            {langsLabel}
          </Text>
        </Flex>
      </div>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--ant-color-split)' }}>
        <Button
          type="primary"
          block
          disabled={!allStepsValid || submitState === 'submitting' || submitState === 'success'}
          loading={submitState === 'submitting'}
          onClick={handleSubmit}
          icon={<DownloadOutlined />}
        >
          {submitState === 'success'
            ? I18n.t('admin.bulk_reports_job_queued')
            : I18n.t('admin.bulk_reports_generate_export')}
        </Button>
        <Text
          type="secondary"
          style={{
            fontSize: 11.5, display: 'block', textAlign: 'center', marginTop: 8,
          }}
        >
          {getSubmitStatusText()}
        </Text>
      </div>
    </Card>
  )

  return (
    <div style={{ padding: isMobile ? '16px' : '24px' }}>
      <Flex
        justify="space-between"
        align={isMobile ? 'flex-start' : 'center'}
        style={{ marginBottom: 24 }}
      >
        <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
          <Title level={4} style={{ margin: 0 }}>{I18n.t('admin.bulk_reports_title')}</Title>
          <Text type="secondary">
            {I18n.t('admin.bulk_reports_description')}
          </Text>
        </div>
        <Button icon={<LeftOutlined />} onClick={() => navigate(`/admin/projects/${projectId}/bulk_reports`)}>
          {I18n.t('shared.back')}
        </Button>
      </Flex>

      <Flex
        gap={24}
        align="flex-start"
        vertical={isMobile}
      >
        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Steps
            current={currentStep}
            direction={isMobile ? 'vertical' : 'horizontal'}
            items={STEPS.map((step, index) => {
              let status: 'finish' | 'process' | 'wait' = 'wait'
              if (index < currentStep) status = 'finish'
              else if (index === currentStep) status = 'process'
              return { title: step.title, status }
            })}
            style={{ marginBottom: 24 }}
            size="small"
          />

          <Card
            styles={{
              body: {
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                height: isMobile ? 'auto' : 'calc(100vh - 260px)',
                minHeight: 480,
              },
            }}
          >
            <div style={{
              flex: isMobile ? undefined : 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: '24px 24px 0',
              height: isMobile ? undefined : '100%',
              minHeight: isMobile ? 400 : 0,
            }}
            >
              {renderStepContent()}
            </div>

            <Flex
              justify="space-between"
              align="center"
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--ant-color-split)',
                flexShrink: 0,
              }}
            >
              <Button onClick={handleBack} disabled={currentStep === 0}>
                {I18n.t('shared.back')}
              </Button>
              {currentStep < STEPS.length - 1 && (
                <Button
                  type="primary"
                  onClick={handleNext}
                  disabled={!stepValid(currentStep)}
                >
                  {I18n.t('shared.continue')}
                </Button>
              )}
            </Flex>
          </Card>
        </div>

        {summaryCard}
      </Flex>
    </div>
  )
}

export default GenerateExport
