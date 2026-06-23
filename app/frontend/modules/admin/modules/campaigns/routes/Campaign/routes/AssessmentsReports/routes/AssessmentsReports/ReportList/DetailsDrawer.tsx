import { FC } from 'react'
import _ from 'lodash'
import { Drawer, Row, Descriptions } from 'antd'

const { I18n } = window

type ExternalSettings = {
  report_id?: string | number
  reportId?: string | number
  norm_id?: string | number
  normId?: string | number
  language_id?: string | number
  languageId?: string | number
  suitability_id?: string | number
  suitabilityId?: string | number
  norm?: string | number
}

export type DrawerReport = {
  id?: number
  externalSettings?: ExternalSettings
  external_settings?: ExternalSettings
  assessmentIds?: number[]
  assessment_ids?: number[]
  reportProvider?: string
  effectiveDefaultLanguage?: string
  effective_default_language?: string
  availableLanguages?: string[]
  available_languages?: string[]
}

interface Props {
  close: () => void
  report: DrawerReport
}

export const DetailsDrawer: FC<Props> = ({ close, report }) => {
  const externalSettings = report.externalSettings ?? report.external_settings ?? {}
  const hasExternalSettings = [
    externalSettings.report_id,
    externalSettings.reportId,
    externalSettings.norm_id,
    externalSettings.normId,
    externalSettings.language_id,
    externalSettings.languageId,
    externalSettings.suitability_id,
    externalSettings.suitabilityId,
    externalSettings.norm,
  ].some(value => !_.isNil(value) && `${value}`.trim() !== '')

  const externalSettingsRows = [
    {
      key: 'externalReportId',
      label: I18n.t('admin.external_report_id'),
      value: externalSettings.report_id ?? externalSettings.reportId ?? '-',
    },
    {
      key: 'normId',
      label: I18n.t('admin.norm_id'),
      value: externalSettings.norm_id ?? externalSettings.normId ?? '-',
    },
    {
      key: 'languageId',
      label: I18n.t('admin.language_id'),
      value: externalSettings.language_id ?? externalSettings.languageId ?? '-',
    },
    {
      key: 'suitabilityId',
      label: I18n.t('admin.suitability_id'),
      value: externalSettings.suitability_id ?? externalSettings.suitabilityId ?? '-',
    },
    {
      key: 'norm',
      label: I18n.t('admin.norm'),
      value: externalSettings.norm ?? '-',
    },
  ]

  return (
    <Drawer
      title={I18n.t('reports.drawer.title')}
      placement="right"
      closable
      onClose={close}
      open
      width="40%"
    >
      <Row>
        <Descriptions
          layout="horizontal"
          rootClassName="w-100"
          bordered
          column={1}
        >
          <Descriptions.Item
            label={I18n.t('admin.campaign_report_id')}
            className="va-t w-30"
            labelStyle={{ width: '40%' }}
            contentStyle={{ width: '60%' }}
          >
            {report.id}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('admin.assessment_ids')}
            className="va-t"
          >
            {_.isEmpty(report.assessmentIds ?? report.assessment_ids)
              ? '—'
              : (report.assessmentIds ?? report.assessment_ids)?.join(', ')}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('admin.provider')}
            className="va-t"
          >
            {report.reportProvider}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('admin.default_language')}
            className="va-t"
          >
            {report.effectiveDefaultLanguage ?? report.effective_default_language}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('admin.available_languages')}
            className="va-t"
          >
            {_.isEmpty(report.availableLanguages ?? report.available_languages)
              ? '—'
              : (
                report.availableLanguages ?? report.available_languages
              )?.join(', ')}
          </Descriptions.Item>
        </Descriptions>
        {hasExternalSettings && (
          <div className="mtm w-100">
            <div className="mbs" style={{ fontWeight: 700 }}>
              {I18n.t('admin.external_settings')}
            </div>
            <Descriptions
              layout="horizontal"
              rootClassName="w-100"
              bordered
              column={1}
            >
              {externalSettingsRows.map(row => (
                <Descriptions.Item
                  key={row.key}
                  label={row.label}
                  className="va-t"
                  styles={{
                    label: { width: '40%' },
                    content: { width: '60%' },
                  }}
                >
                  {row.value}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </div>
        )}
      </Row>
    </Drawer>
  )
}
