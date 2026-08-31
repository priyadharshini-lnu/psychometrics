import React, { useState } from 'react'
import _ from 'lodash'
import {
  Drawer, Row, Descriptions, Typography, Alert, Space,
} from 'antd'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import UserReport from '~/modules/admin/modules/campaigns/interfaces/UserReport'

const { I18n } = window

type ExternalSettings = {
  report_id?: string | number
  reportId?: string | number
  external_report_id?: string | number
  externalReportId?: string | number
  norm_id?: string | number
  normId?: string | number
  language_id?: string | number
  languageId?: string | number
  suitability_id?: string | number
  suitabilityId?: string | number
  norm?: string | number
}

type UserReportWithExternalSettings = UserReport & {
  externalSettings?: ExternalSettings
  external_settings?: ExternalSettings
  owner?: { id: string; name: string } | null
}

interface Props {
  close: () => void
  report: UserReport
}

const DetailsDrawer: React.FC<Props> = ({ close, report }) => {
  const [availabilityReasonMessage, setAvailabilityReasonMessage] = useState('')
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false)

  const fetchAvailabilityDetails = async () => {
    try {
      setIsAvailabilityLoading(true)
      const response = await fetch(`/api/v2/administration/user_reports/${report.id}/availability_details.json`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        return
      }

      setAvailabilityReasonMessage(data.reason_message ?? data.reasonMessage ?? 'Unable to fetch details right now.')
    } catch {
      // Intentionally no popup for failed requests
    } finally {
      setIsAvailabilityLoading(false)
    }
  }

  const handleCheckDetailsClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!isAvailabilityLoading) fetchAvailabilityDetails()
  }

  const reportWithExternalSettings = report as UserReportWithExternalSettings
  const externalSettings = reportWithExternalSettings.externalSettings
    ?? reportWithExternalSettings.external_settings
    ?? {}
  const hasExternalSettings = [
    externalSettings.report_id,
    externalSettings.reportId,
    externalSettings.external_report_id,
    externalSettings.externalReportId,
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
      value: externalSettings.report_id
        ?? externalSettings.reportId
        ?? externalSettings.external_report_id
        ?? externalSettings.externalReportId
        ?? '-',
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
            label={I18n.t('admin.user_report_id')}
            className="va-t w-30"
            labelStyle={{ width: '40%' }}
            contentStyle={{ width: '60%' }}
          >
            {report.id}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('common.column.owner')}
            className="va-t"
          >
            {reportWithExternalSettings.owner?.name || I18n.t('admin.platform_owner')}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('admin.assessment_ids')}
            className="va-t"
          >
            {_.isEmpty(report.assessmentIds) ? '—' : report.assessmentIds?.join(', ')}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('admin.report_pdf_status')}
            className="va-t"
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space size="middle">
                <span>{report.status ? I18n.t(`user_reports.statuses.${report.status}`) : '-'}</span>
                {report.status === 'not_prepared' && (
                  <Typography.Link
                    disabled={isAvailabilityLoading}
                    onClick={handleCheckDetailsClick}
                  >
                    <InfoCircleOutlined style={{ marginRight: 4 }} />
                    {I18n.t('admin.check_details')}
                  </Typography.Link>
                )}
              </Space>
              {report.status === 'not_prepared' && availabilityReasonMessage && (
                <Alert
                  type="info"
                  showIcon
                  message={(
                    <Typography.Text style={{ whiteSpace: 'pre-line' }}>
                      {availabilityReasonMessage}
                    </Typography.Text>
                  )}
                />
              )}
            </Space>
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
            {report.effectiveDefaultLanguage}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('admin.available_languages')}
            className="va-t"
          >
            {_.isEmpty(report.availableLanguages) ? '—' : report.availableLanguages.join(', ')}
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

export default DetailsDrawer
