import { FC } from 'react'
import {
  Typography, Flex, Empty, Button, Tag, Card,
} from 'antd'
import { getLanguageLabel } from '../core'
import { DerivedReport } from '../types'

const { Text } = Typography
const { I18n } = window

type Props = {
  reports: DerivedReport[]
  reportLanguages: Record<string, Set<string>>
  onLanguageChange: (reportLanguages: Record<string, Set<string>>) => void
}

const withUpdatedSet = (
  current: Record<string, Set<string>>,
  reportId: string,
  next: Set<string>,
): Record<string, Set<string>> => ({ ...current, [reportId]: next })

type ReportGroupProps = {
  report: DerivedReport
  selectedLangs: Set<string>
  onToggleLang: (reportId: string, lang: string) => void
  onToggleAll: (reportId: string) => void
}

const ReportGroup: FC<ReportGroupProps> = ({
  report, selectedLangs, onToggleLang, onToggleAll,
}) => {
  const langs = report.availableLanguages
  const allSelected = langs.length > 0 && langs.every(l => selectedLangs.has(l))

  return (
    <Card size="small" style={{ marginBottom: 12 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Flex align="center" gap={8}>
          <Text strong style={{ fontSize: 14 }}>
            {report.name}
          </Text>
          <Tag style={{ margin: 0, fontFamily: 'monospace', fontSize: 10.5 }}>
            {report.format}
          </Tag>
        </Flex>
        <Button
          type="link"
          size="small"
          onClick={() => onToggleAll(report.reportId)}
          style={{ padding: 0, fontWeight: 600 }}
        >
          {allSelected ? I18n.t('admin.common_unselect_all') : I18n.t('admin.common_select_all')}
        </Button>
      </Flex>

      {langs.length === 0 ? (
        <Text type="secondary" style={{ fontSize: 13, fontStyle: 'italic' }}>
          {I18n.t('admin.bulk_reports_no_languages_available')}
        </Text>
      ) : (
        <Flex wrap="wrap" gap={8}>
          {langs.map((lang) => {
            const isOn = selectedLangs.has(lang)
            return (
              <Button
                key={lang}
                type={isOn ? 'primary' : 'default'}
                shape="round"
                size="small"
                onClick={() => onToggleLang(report.reportId, lang)}
              >
                {getLanguageLabel(lang)}
              </Button>
            )
          })}
        </Flex>
      )}
    </Card>
  )
}


const LanguageSelectionStep: FC<Props> = ({
  reports,
  reportLanguages,
  onLanguageChange,
}) => {
  const handleToggleLang = (reportId: string, lang: string) => {
    const current = reportLanguages[reportId] ?? new Set<string>()
    const next = new Set(current)
    if (next.has(lang)) {
      next.delete(lang)
    } else {
      next.add(lang)
    }
    onLanguageChange(withUpdatedSet(reportLanguages, reportId, next))
  }

  const handleToggleAll = (reportId: string) => {
    const report = reports.find(r => r.reportId === reportId)
    if (!report) return
    const current = reportLanguages[reportId] ?? new Set<string>()
    const allSelected = report.availableLanguages.every(l => current.has(l))
    const next = allSelected ? new Set<string>() : new Set(report.availableLanguages)
    onLanguageChange(withUpdatedSet(reportLanguages, reportId, next))
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
        {I18n.t('admin.bulk_reports_select_languages')}
      </Text>
      <Text type="secondary" style={{ display: 'block', marginBottom: 20, fontSize: 13.5 }}>
        {I18n.t('admin.bulk_reports_select_languages_description')}
      </Text>

      {reports.length === 0 ? (
        <Empty
          description={(
            <Text type="secondary">
              {I18n.t('admin.bulk_reports_no_reports_selected_for_languages')}
            </Text>
          )}
          style={{ padding: '24px 0' }}
        />
      ) : (
        <div>
          {reports.map(report => (
            <ReportGroup
              key={report.reportId}
              report={report}
              selectedLangs={reportLanguages[report.reportId] ?? new Set()}
              onToggleLang={handleToggleLang}
              onToggleAll={handleToggleAll}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelectionStep
