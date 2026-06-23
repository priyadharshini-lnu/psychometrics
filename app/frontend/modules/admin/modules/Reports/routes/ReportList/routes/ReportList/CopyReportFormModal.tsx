import React from 'react'
import {
  Form, Input, App,
  Select,
  Spin,
} from 'antd'

import * as t from 'io-ts'
import { connect } from 'react-redux'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { Report } from '~/modules/admin/modules/client/core/reports'

import ResourceFormModal from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
)

type OptionsType = {
  id: string
  name: string
}

interface Props {
  report: Report
  close(): void
  currentUser
}

type RequestFileds = {
  name: string
}

const CopyReportFormModal: React.FC<Props> = ({
  report, close, currentUser,
}) => {
  const { message } = App.useApp()
  const { resource } = useResourceContext<Report>()

  const copy = (values: RequestFileds) => resource.memberAction({
    id: report.id,
    action: 'copy',
    method: 'post',
    responseType: t.string,
    body: values,
  }).then(() => {
    message.info(I18n.t('admin.copy_report_scheduled'))
  })

  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const getClients = (): OptionsType[] => {
    if (!report || !report.owner || clients.find(d => report?.owner?.id === d.id)) {
      return clients
    }

    return [...clients, report.owner]
  }

  return (
    <ResourceFormModal
      resourceName="assessments"
      title={I18n.t('admin.reports_copy_copy_report')}
      readableResourceName={I18n.t('admin.reports_copy_copy_report')}
      close={close}
      scrollToFirstError
      request={{ createResource: copy }}
      modalProps={{ width: 550 }}
      formProps={{ initialValues: { name: `${report.name} - ${I18n.t('admin.reports_copy_copy')}` } }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
            rules={[{ required: true, transform: value => value.trim() }]}
          >
            <Input name="report_name" />
          </Form.Item>
          <Form.Item
            name="ownerId"
            label={I18n.t('shared.owner')}
            initialValue={report?.owner?.id || null}
          >
            <Select
              showSearch={{
                filterOption: false,
                onSearch: (value) => {
                  fetchClients({
                    apiConfig: { filter: { filterable_fields: value }, fields: { clients: ['name'] } },
                  })
                },
              }}
              notFoundContent={isClientsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
            >
              {isSuperAdmin(currentUser) && <Select.Option>TTE</Select.Option>}
              {getClients().map(({ id, name }) => (
                <Select.Option key={id} value={id}>{name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}

export default connecter(CopyReportFormModal)
