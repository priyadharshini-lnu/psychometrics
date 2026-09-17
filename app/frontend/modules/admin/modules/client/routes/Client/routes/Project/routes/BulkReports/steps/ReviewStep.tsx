import { FC, useMemo } from 'react'
import {
  Typography, Flex, Card, Divider, Form, Checkbox, Grid,
} from 'antd'
import { deriveSelectedReports, formatCampaignCount, getLanguageLabel } from '../core'
import { LocalCampaign, DerivedReport } from '../types'

const { Text, Title } = Typography
const { useBreakpoint } = Grid
const { I18n } = window

type Props = {
  selectedCampaigns: LocalCampaign[]
  selectedReportIds: Set<string>
  startDate: string
  endDate: string
  reportLanguages: Record<string, Set<string>>
  includeInactiveUsers: boolean
  onIncludeInactiveUsersChange: (val: boolean) => void
}


const SectionLabel: FC<{ label: string; count?: number }> = ({ label, count }) => (
  <Text
    type="secondary"
    style={{
      display: 'block',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: 10,
    }}
  >
    {label}
    {count !== undefined && (
      <span style={{ marginLeft: 6, fontWeight: 400, letterSpacing: 0 }}>
        ·
        {' '}
        {count}
      </span>
    )}
  </Text>
)

const ReviewStep: FC<Props> = ({
  selectedCampaigns,
  selectedReportIds,
  startDate,
  endDate,
  reportLanguages,
  includeInactiveUsers,
  onIncludeInactiveUsersChange,
}) => {
  const reports = useMemo(
    () => deriveSelectedReports(selectedCampaigns, selectedReportIds),
    [selectedCampaigns, selectedReportIds],
  )

  const screens = useBreakpoint()
  const isMobile = !screens.md
  const dateRangeSet = !!startDate && !!endDate && startDate <= endDate

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
        {I18n.t('admin.bulk_reports_review_submit')}
      </Text>
      <Text type="secondary" style={{ display: 'block', marginBottom: 20, fontSize: 13.5 }}>
        {I18n.t('admin.bulk_reports_review_submit_description')}
      </Text>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 12,
      }}
      >

        <Card size="small">
          <SectionLabel label={I18n.t('admin.campaigns')} count={selectedCampaigns.length} />
          {selectedCampaigns.length === 0 ? (
            <Text type="danger" style={{ fontSize: 13, fontWeight: 600 }}>
              {I18n.t('admin.bulk_reports_no_campaigns_selected')}
            </Text>
          ) : (
            <ul style={{
              margin: 0, paddingLeft: 18, fontSize: 13.5, maxHeight: 180, overflowY: 'auto',
            }}
            >
              {selectedCampaigns.map(c => (
                <li key={String(c.id)} style={{ marginBottom: 3 }}>
                  <Text style={{ fontSize: 13.5 }}>{c.name}</Text>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card size="small">
          <SectionLabel label={I18n.t('admin.date_range')} />
          {!dateRangeSet ? (
            <Text type="danger" style={{ fontSize: 13, fontWeight: 600 }}>
              {I18n.t('admin.bulk_reports_not_set')}
            </Text>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5 }}>
              <li>
                <Text style={{ fontFamily: 'monospace', fontSize: 13.5 }}>
                  {startDate}
                  {' '}
                  →
                  {' '}
                  {endDate}
                </Text>
              </li>
            </ul>
          )}
        </Card>

        <Card size="small" style={{ gridColumn: '1 / -1' }}>
          <SectionLabel label={I18n.t('admin.bulk_reports_reports_and_languages')} count={reports.length} />
          {reports.length === 0 ? (
            <Text type="danger" style={{ fontSize: 13, fontWeight: 600 }}>
              {I18n.t('admin.bulk_reports_no_reports_selected')}
            </Text>
          ) : (
            <div>
              {reports.map((report, idx) => {
                const langs = [...(reportLanguages[report.reportId] ?? new Set<string>())]
                const hasLangs = langs.length > 0
                return (
                  <div key={report.reportId}>
                    {idx > 0 && <Divider style={{ margin: '8px 0' }} />}
                    {isMobile ? (
                      <div>
                        <Text strong style={{ fontSize: 13.5, display: 'block' }}>
                          {report.name}
                        </Text>
                        {hasLangs ? (
                          <Text type="secondary" style={{ fontSize: 13, marginTop: 2, display: 'block' }}>
                            {langs.map(l => getLanguageLabel(l)).join(', ')}
                          </Text>
                        ) : (
                          <Text
                            type="danger"
                            style={{
                              fontSize: 12.5, fontStyle: 'italic', display: 'block', marginTop: 2,
                            }}
                          >
                            {I18n.t('admin.bulk_reports_no_language_selected')}
                          </Text>
                        )}
                      </div>
                    ) : (
                      <Flex justify="space-between" align="baseline" gap={16}>
                        <Text strong style={{ fontSize: 13.5, flexShrink: 0 }}>
                          {report.name}
                        </Text>
                        {hasLangs ? (
                          <Text type="secondary" style={{ fontSize: 13.5, textAlign: 'right' }}>
                            {langs.map(l => getLanguageLabel(l)).join(', ')}
                          </Text>
                        ) : (
                          <Text type="danger" style={{ fontSize: 12.5, fontStyle: 'italic', textAlign: 'right' }}>
                            {I18n.t('admin.bulk_reports_no_language_selected')}
                          </Text>
                        )}
                      </Flex>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Form component={false} style={{ gridColumn: '1 / -1' }}>
          <Form.Item
            name="includeInactiveUsers"
            valuePropName="checked"
            className="mt-4 mb-0"
            style={{ marginBottom: 0 }}
          >
            <Checkbox
              checked={includeInactiveUsers}
              onChange={e => onIncludeInactiveUsersChange(e.target.checked)}
            >
              {I18n.t('user.modals.exports.include_inactive_users')}
            </Checkbox>
          </Form.Item>
        </Form>

        <EstimateStrip
          selectedCampaigns={selectedCampaigns}
          reports={reports}
          reportLanguages={reportLanguages}
          selectedReportIds={selectedReportIds}
        />
      </div>
    </div>
  )
}


type EstimateStripProps = {
  selectedCampaigns: LocalCampaign[]
  reports: DerivedReport[]
  reportLanguages: Record<string, Set<string>>
  selectedReportIds: Set<string>
}

const EstimateStrip: FC<EstimateStripProps> = ({
  selectedCampaigns,
  reports,
  reportLanguages,
  selectedReportIds,
}) => {
  const totalCandidates = selectedCampaigns.reduce((sum, c) => sum + (c.candidatesCount ?? 0), 0)

  const totalLangSlots = [...selectedReportIds].reduce((sum, rid) => sum + (reportLanguages[rid]?.size ?? 0), 0)

  const totalFiles = totalCandidates > 0
    ? totalCandidates * totalLangSlots
    : totalLangSlots * selectedCampaigns.length

  if (reports.length === 0 || selectedCampaigns.length === 0) return null

  return (
    <Card
      size="small"
      style={{
        gridColumn: '1 / -1',
        background: 'var(--ant-color-fill-quaternary)',
        borderStyle: 'dashed',
      }}
      styles={{ body: { display: 'flex', alignItems: 'center', gap: 12 } }}
    >
      <Title
        level={3}
        style={{
          margin: 0,
          fontFamily: 'monospace',
          flexShrink: 0,
          color: 'var(--ant-color-primary)',
        }}
      >
        ~
        {totalFiles.toLocaleString()}
      </Title>
      <Text style={{ fontSize: 13.5 }}>
        {I18n.t('admin.bulk_reports_files_estimated_across')}
        {' '}
        <Text strong style={{ fontSize: 13.5 }}>
          {totalCandidates > 0 ? totalCandidates.toLocaleString() : selectedCampaigns.length}
        </Text>
        {' '}
        {totalCandidates > 0
          ? I18n.t('shared.candidates')
          : formatCampaignCount(selectedCampaigns.length)}
        {' '}
        {I18n.t('admin.bulk_reports_bundled_into_single')}
        <Text strong style={{ fontSize: 13.5 }}>.zip</Text>
        {' '}
        {I18n.t('admin.bulk_reports_emailed_when_ready')}
      </Text>
    </Card>
  )
}

export default ReviewStep
