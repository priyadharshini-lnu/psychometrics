import React, { useState } from 'react'
import { App, Button } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { formatedDate } from '~/utils/time'
import campaignSettings from '~/modules/admin/modules/campaigns/settings'
import projectSettings from '~/modules/admin/modules/client/routes/Client/routes/Project/settings'
import { CommunicationDelivery } from './core/communicationDeliveries'
import { TemplateScope, TERMINAL_STATUSES } from './constants'
import { DeliveryForm } from './DeliveryForm'

const { I18n } = window

interface DeliveriesFilterProps {
  onNewDelivery: () => void
}

const DeliveriesFilter: React.FC<DeliveriesFilterProps> = ({ onNewDelivery }) => {
  const { resource } = useResourceContext<CommunicationDelivery>()
  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter name="status_eq">
      <Button type="primary" disabled={tableLoading} onClick={onNewDelivery}>
        <PlusOutlined />
        {I18n.t('admin.communication_delivery_new_button')}
      </Button>
    </Resource.Filter>
  )
}

const CancelButton: React.FC<{ delivery: CommunicationDelivery }> = ({ delivery }) => {
  const { resource } = useResourceContext<CommunicationDelivery>()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)

  if (TERMINAL_STATUSES.includes(delivery.status || '')) return null

  const handleCancel = () => {
    setLoading(true)
    resource.memberAction({
      id: delivery.id,
      action: 'cancel',
      method: 'post',
    }).then(() => {
      resource.fetch()
    }).catch(() => {
      message.error(I18n.t('admin.communication_delivery_cancel_error'))
    }).finally(() => {
      setLoading(false)
    })
  }

  return (
    <Button type="link" danger loading={loading} onClick={handleCancel}>
      {I18n.t('admin.communication_delivery_cancel_action')}
    </Button>
  )
}

const DeliveriesTable: React.FC = () => {
  const { projectId, campaignId } = useParams()

  return (
    <Resource.Table pagination>
      <Resource.Column<CommunicationDelivery>
        id="communication_template_name"
        title={I18n.t('admin.communication_delivery_template_label')}
        hideable={false}
        width={260}
        fixed="left"
        render={(_value, delivery) => {
          const campaignPath = `${campaignSettings.urlPrefix.replace(':projectId', String(projectId))}/${campaignId}`
            + `/communication_center/communications/${delivery.id}`
          const projectPath = `${projectSettings.urlPrefix}/${projectId}/communication_center/deliveries/${delivery.id}`
          const path = campaignId ? campaignPath : projectPath

          return (
            <Link to={path}>
              {delivery.communicationTemplate?.name || '-'}
            </Link>
          )
        }}
      />
      <Resource.Column<CommunicationDelivery>
        id="trigger_type"
        dataIndex="triggerType"
        title={I18n.t('admin.communication_delivery_trigger_type_label')}
        sorter
        width={160}
        render={(_value, delivery) => I18n.t(`admin.communication_delivery_trigger_type_${delivery.triggerType}`)}
      />
      <Resource.Column<CommunicationDelivery>
        id="delivery_rule"
        dataIndex="deliveryRule"
        title={I18n.t('admin.communication_delivery_rule_label')}
        width={180}
        render={(_value, delivery) => (
          delivery.deliveryRule
            ? I18n.t(`admin.communication_delivery_rule_${delivery.deliveryRule}`)
            : '-'
        )}
      />
      <Resource.Column<CommunicationDelivery>
        id="status"
        title={I18n.t('shared.status')}
        sorter
        width={120}
      />
      <Resource.Column<CommunicationDelivery>
        id="delivery_at"
        dataIndex="deliveryAt"
        title={I18n.t('admin.communication_delivery_at_label')}
        width={180}
        render={value => (value ? formatedDate(value) : '-')}
      />
      <Resource.Column<CommunicationDelivery>
        id="updated_at"
        dataIndex="updatedAt"
        title={I18n.t('shared.updated_at')}
        sorter
        width={180}
        render={value => formatedDate(value)}
      />
      <Resource.Column<CommunicationDelivery>
        id="action"
        title={I18n.t('common.column.action')}
        hideable={false}
        width={120}
        fixed="right"
        render={(_value, delivery) => <CancelButton delivery={delivery} />}
      />
    </Resource.Table>
  )
}


interface Props {
  scope: TemplateScope
}

export const DeliveriesList: React.FC<Props> = ({ scope }) => {
  const [showForm, setShowForm] = useState(false)

  const filter: Record<string, string> = scope.campaignId
    ? { campaign_id_eq: scope.campaignId }
    : { project_id_eq: scope.projectId || '' }

  const config = {
    trackUrl: true,
    apiConfig: {
      filter,
      include: ['communication_template'],
    },
  }

  return (
    <Resource
      title={I18n.t('admin.communication_deliveries')}
      config={config}
      name="communication_deliveries"
      settingsKey={TABLE_SETTINGS_KEYS.communicationCenterDeliveries}
    >
      <DeliveriesFilter onNewDelivery={() => setShowForm(true)} />
      <DeliveriesTable />
      {showForm && (
        <DeliveryForm
          scope={scope}
          close={() => setShowForm(false)}
        />
      )}
    </Resource>
  )
}
