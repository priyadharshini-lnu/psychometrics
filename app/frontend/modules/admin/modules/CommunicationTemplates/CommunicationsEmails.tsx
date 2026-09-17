import React, { useEffect, useState } from 'react'
import {
  App, Button, Tag, Typography, Space, Statistic,
} from 'antd'
import { PageHeader } from '@thetalententerprise/glint'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { ArrowLeftOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { DocumentTitle } from '~/components/DocumentTitle'
import { useResources } from '~/hooks/useResources'
import { CommunicationEmail } from './core/communicationEmails'
import { CommunicationDelivery, CommunicationDeliveryTR } from './core/communicationDeliveries'
import { EmailPreviewModal, EmailPreview } from './EmailPreviewModal'

const { I18n } = window

const STATUS_TO_COLOR: Record<string, string> = {
  pending: 'default',
  queued: 'processing',
  sent: 'success',
  failed: 'error',
  skipped: 'default',
  cancelled: 'default',
}

const PreviewButton: React.FC<{ email: CommunicationEmail }> = ({ email }) => {
  const { resource } = useResourceContext<CommunicationEmail>()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<EmailPreview | null>(null)
  const [locale, setLocale] = useState<string>(I18n.currentLocale() || 'en')

  const fetchPreview = (previewLocale: string) => {
    setLoading(true)
    resource.memberAction({
      id: email.id,
      action: 'preview',
      method: 'get',
      apiConfig: { query: { locale: previewLocale } },
    }).then((response) => {
      setPreview(response as unknown as EmailPreview)
    }).catch(() => {
      message.error(I18n.t('shared.error'))
    }).finally(() => {
      setLoading(false)
    })
  }

  const handlePreview = () => {
    setLocale(I18n.currentLocale() || 'en')
    fetchPreview(I18n.currentLocale() || 'en')
  }

  const handleLocaleChange = (nextLocale: string) => {
    setLocale(nextLocale)
    fetchPreview(nextLocale)
  }

  const to = email.recipientName
    ? `${email.recipientName} <${email.recipientEmail || '-'}>`
    : (email.recipientEmail || '-')
  const date = email.sentAt
    ? dayjs(email.sentAt).format('L LT')
    : I18n.t('admin.communication_email_not_sent')

  return (
    <>
      <Button type="link" loading={loading} onClick={handlePreview}>
        {I18n.t('admin.communication_email_preview_action')}
      </Button>
      {preview && (
        <EmailPreviewModal
          preview={preview}
          to={to}
          date={date}
          locale={locale}
          onLocaleChange={handleLocaleChange}
          close={() => setPreview(null)}
        />
      )}
    </>
  )
}

const RetriggerButton: React.FC<{ email: CommunicationEmail }> = ({ email }) => {
  const { resource } = useResourceContext<CommunicationEmail>()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)

  if (email.status !== 'failed') return null

  const handleRetrigger = () => {
    setLoading(true)
    resource.memberAction({
      id: email.id,
      action: 'retrigger',
      method: 'post',
    }).then(() => {
      resource.fetch()
    }).catch(() => {
      message.error(I18n.t('admin.communication_email_retrigger_error'))
    }).finally(() => {
      setLoading(false)
    })
  }

  return (
    <Button type="link" loading={loading} onClick={handleRetrigger}>
      {I18n.t('admin.communication_email_retrigger_action')}
    </Button>
  )
}

const CommunicationEmailsTable: React.FC = () => (
  <Resource.Table pagination>
    <Resource.Column<CommunicationEmail>
      id="recipient_name"
      dataIndex="recipientName"
      title={I18n.t('admin.communication_email_recipient_name_label')}
      hideable={false}
      width={200}
      fixed="left"
      render={(_value, email) => email.recipientName || '-'}
    />
    <Resource.Column<CommunicationEmail>
      id="recipient_email"
      dataIndex="recipientEmail"
      title={I18n.t('admin.communication_email_recipient_email_label')}
      width={220}
      render={(_value, email) => email.recipientEmail || '-'}
    />
    <Resource.Column<CommunicationEmail>
      id="subject"
      dataIndex="subject"
      title={I18n.t('admin.communication_email_subject_label')}
      render={(_value, email) => (
        <Typography.Text ellipsis={{ tooltip: email.subject }} style={{ maxWidth: 320, display: 'block' }}>
          {email.subject || '-'}
        </Typography.Text>
      )}
    />
    <Resource.Column<CommunicationEmail>
      id="status"
      dataIndex="status"
      title={I18n.t('admin.communication_email_status_label')}
      width={120}
      render={(_value, email) => (
        <Tag color={STATUS_TO_COLOR[email.status]}>
          {I18n.t(`admin.statuses_${email.status}`)}
        </Tag>
      )}
    />
    <Resource.Column<CommunicationEmail>
      id="sent_at"
      dataIndex="sentAt"
      title={I18n.t('admin.communication_email_sent_at_label')}
      sorter
      width={200}
      render={(_value, email) => (
        email.sentAt ? dayjs(email.sentAt).format('L LT') : I18n.t('admin.communication_email_not_sent')
      )}
    />
    <Resource.Column<CommunicationEmail>
      id="created_at"
      dataIndex="createdAt"
      title={I18n.t('admin.communication_email_created_at_label')}
      sorter
      width={200}
      render={(_value, email) => (email.createdAt ? dayjs(email.createdAt).format('L LT') : '-')}
    />
    <Resource.Column<CommunicationEmail>
      id="action"
      title={I18n.t('common.column.action')}
      hideable={false}
      width={200}
      fixed="right"
      render={(_value, email) => (
        <>
          <PreviewButton email={email} />
          <RetriggerButton email={email} />
        </>
      )}
    />
  </Resource.Table>
)

const DeliveryHeader: React.FC<{ deliveryId: string }> = ({ deliveryId }) => {
  const { projectId, campaignId } = useParams() as { projectId: string, campaignId?: string }
  const navigate = useNavigate()
  const [delivery, setDelivery] = useState<CommunicationDelivery | null>(null)

  const { fetchSingle } = useResources<CommunicationDelivery>('communication_deliveries', {
    responseType: CommunicationDeliveryTR,
    apiConfig: { include: ['communication_template'] },
  })

  useEffect(() => {
    fetchSingle({ id: deliveryId }).then(result => setDelivery(result as CommunicationDelivery))
  }, [deliveryId])

  const backPath = campaignId
    ? `/admin/projects/${projectId}/new_campaigns/${campaignId}/communication_center/communications`
    : `/admin/projects/${projectId}/communication_center/deliveries`

  return (
    <PageHeader
      title={delivery?.communicationTemplate?.name || I18n.t('admin.communication_delivery_details_title')}
      actions={(
        <Space size="large">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(backPath)}>
            {I18n.t('shared.back')}
          </Button>
          <Statistic
            title={I18n.t('admin.communication_delivery_emails_total_label')}
            value={delivery?.emailsCount ?? 0}
            styles={{ content: { fontSize: 14 } }}
          />
          <Statistic
            title={I18n.t('admin.communication_delivery_emails_sent_label')}
            value={delivery?.emailsSentCount ?? 0}
            styles={{ content: { fontSize: 14 } }}
          />
        </Space>
      )}
    />
  )
}

interface Props {
  scope: { deliveryId?: string }
}

export const CommunicationsEmails: React.FC<Props> = ({ scope }) => {
  const config = {
    trackUrl: true,
    apiConfig: {
      filter: { communication_delivery_id_eq: scope.deliveryId || '' },
    },
  }

  return (
    <>
      <DocumentTitle text={I18n.t('admin.communication_delivery_details_title')} />
      {scope.deliveryId && <DeliveryHeader deliveryId={scope.deliveryId} />}
      <Resource
        title={I18n.t('admin.communication_emails')}
        config={config}
        name="communication_emails"
        settingsKey={TABLE_SETTINGS_KEYS.communicationCenterDeliveryEmails}
      >
        <CommunicationEmailsTable />
      </Resource>
    </>
  )
}
