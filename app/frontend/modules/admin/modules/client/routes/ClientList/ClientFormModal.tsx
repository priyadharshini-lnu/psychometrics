import React from 'react'
import {
  Form, Input, Select, Spin, Typography,
} from 'antd'
import _ from 'lodash'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import { User } from '~/modules/admin/modules/client/core/users'
import { AdditionRelationshipAttribute } from '~/libs/jsonApi/interfaces'
import { Client } from '../../core/clients'

const { I18n } = window
const { Option } = Select

interface Props {
  client: AdditionRelationshipAttribute<Client>
  addClient: CreateResource<Client>
  updateClient: UpdateResource<Client>
  close(): void
  types: string[]
  countries: string[]
}

export const ClientFormModal: React.FC<Props> = ({
  client,
  addClient,
  updateClient,
  close,
  types,
  countries,
}) => {
  const {
    data: projectManagers, fetch: fetchProjectManager, isLoading: isProjectManagerLoading,
  } = useResources<User>('users')
  const currentYear = new Date().getFullYear()
  const projectManagersOpts = client?.projectManager ? projectManagers.concat(client.projectManager) : projectManagers

  const getAdminUrl = (subdomain: string) => {
    const { protocol, hostname, port } = window.location
    const hostParts = hostname.split('.')
    const baseDomain = hostParts.length > 2 ? hostParts.slice(1).join('.') : hostname
    const portSuffix = port ? `:${port}` : ''
    return `${protocol}//${subdomain}-admin.${baseDomain}${portSuffix}`
  }

  return (
    <ResourceFormModal
      resourceName="clients"
      resource={client}
      readableResourceName={I18n.t('admin.client')}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      request={{
        createResource: addClient,
        updateResource: updateClient,
      }}
    >
      {({ form }) => {
        const subdomainValue = Form.useWatch('subdomain', form)

        return (
          <>
            <Form.Item
              name="name"
              label={I18n.t('shared.name')}
              rules={[{ required: true }]}
            >
              <Input name="client_name" />
            </Form.Item>
            <Form.Item
              name="subdomain"
              label={I18n.t('admin.subdomain')}
              rules={[
                { required: true },
                { max: 32, message: I18n.t('admin.subdomain_too_long_max_32') },
                {
                  pattern: /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/,
                  message: I18n.t('admin.subdomain_invalid_format'),
                },
                {
                  validator: (_, value) => {
                    if (value && /(^admin$|-admin$|-admin-)/i.test(value)) {
                      return Promise.reject(new Error(
                        I18n.t('admin.subdomain_admin_keyword'),
                      ))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
              extra={subdomainValue && (
                <Typography.Link
                  href={getAdminUrl(subdomainValue)}
                  target="_blank"
                >
                  {getAdminUrl(subdomainValue)}
                </Typography.Link>
              )}
            >
              <Input name="client_subdomain" />
            </Form.Item>
            <Form.Item
              name="type"
              label={I18n.t('shared.type')}
              rules={[{ required: true }]}
            >
              <Select showSearch>
                {types.map(type => (
                  <Option key={type} value={type}>{I18n.t(`activerecord.attributes.client.types.${type}`)}</Option>))}
              </Select>
            </Form.Item>
            <Form.Item
              name="number"
              label={I18n.t('admin.number')}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="country"
              label={I18n.t('admin.country')}
              rules={[{ required: true }]}
            >
              <Select showSearch>
                {countries.map(country => (
                  <Option key={country} value={country}>{country}</Option>))}
              </Select>
            </Form.Item>
            <Form.Item
              name="year"
              label={I18n.t('admin.year')}
              rules={[{ required: true }]}
            >
              <Select>
                {_.range(currentYear - 2, currentYear + 10).map(
                  year => (<Option key={year} value={year}>{year}</Option>),
                )}
              </Select>
            </Form.Item>
            <Form.Item
              name="projectManagerId"
              label={I18n.t('admin.project_manager')}
              rules={[{ required: true }]}
            >
              <Select
                showSearch={{
                  filterOption: false,
                  onSearch: (value) => {
                    fetchProjectManager({
                      apiConfig: {
                        filter: { search_query: value, admins: 'true' },
                        fields: { users: ['name', 'email'] },
                      },
                    })
                  },
                }}
                notFoundContent={
                  isProjectManagerLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')
                }
              >
                {projectManagersOpts.map(({ id, name, email }) => (
                  <Option key={id} value={id}>
                    {name}
                    {' '}
                    (
                    {email}
                    )
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )
      }}
    </ResourceFormModal>
  )
}
