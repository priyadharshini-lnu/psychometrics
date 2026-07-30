import React, {
  useCallback, useEffect, useMemo,
} from 'react'
import {
  Form, Input, Select, Spin,
} from 'antd'
import debounce from 'lodash/debounce'
import ResourceFormModal from '~/components/ResourceFormModal'
import { isSuperAdmin } from '~/core/currentUser'
import { useCurrentUser } from '~/hooks/useCurrentUser'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { ReportBundle } from '~/modules/admin/modules/client/core/reports'
import { useResources } from '~/hooks/useResources'

interface Props {
  close(): void
  currentReportBundle?: ReportBundle
}

const { I18n } = window
const { Option } = Select

export const ReportBundleFormModal: React.FC<Props> = ({ currentReportBundle, close }) => {
  const { currentUser } = useCurrentUser()
  const { resource } = useResourceContext()
  const [form] = Form.useForm()
  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const clientId = useMemo(() => {
    if (currentReportBundle?.clientId) return currentReportBundle.clientId
    if (currentReportBundle?.clientId === null) return null
    if (isSuperAdmin(currentUser)) return null

    return undefined
  }, [currentReportBundle?.clientId, currentUser])

  const getClients = useCallback(() => {
    const clientsList = clients

    if (currentReportBundle?.clientId && currentReportBundle.tenantName) {
      const tenantExists = clientsList.find(c => c.id === currentReportBundle.clientId)
      if (!tenantExists) {
        return [
          ...clientsList,
          { id: currentReportBundle.clientId, name: currentReportBundle.tenantName },
        ]
      }
    }

    return clientsList
  }, [currentReportBundle?.clientId, currentReportBundle?.tenantName, clients])

  const searchAvailableOwners = useMemo(() => debounce((value) => {
    fetchClients({
      apiConfig: { filter: { filterable_fields: value }, fields: { clients: ['name'] } },
    })
  }, 50), [fetchClients])

  useEffect(() => {
    fetchClients({
      apiConfig: { fields: { clients: ['name'] } },
    })
  }, [])

  useEffect(() => () => {
    searchAvailableOwners.cancel()
  }, [searchAvailableOwners])

  return (
    <ResourceFormModal
      resourceName="report_families"
      readableResourceName={I18n.t('report_bundles.report_bundle')}
      showSuccessMessages
      close={close}
      resource={currentReportBundle}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource, updateResource: resource.updateResource }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('common.column.name')}
            rules={[{ required: true }]}
          >
            <Input name="report_bundle_name" />
          </Form.Item>
          <Form.Item
            name="clientId"
            label={I18n.t('common.column.owner')}
            initialValue={clientId}
          >
            <Select
              placeholder={I18n.t('admin.campaign_templates_form_owner_placeholder')}
              showSearch
              filterOption={false}
              onSearch={searchAvailableOwners}
              notFoundContent={isClientsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
            >
              {isSuperAdmin(currentUser) && <Option value={null}>{I18n.t('admin.tte')}</Option>}
              {getClients().map(({ id, name }) => (
                <Option key={id} value={id}>{name}</Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
