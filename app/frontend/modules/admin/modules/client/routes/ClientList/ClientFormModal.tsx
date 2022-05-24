import React, { FC, ReactElement, useEffect, useState } from 'react'
import { Form, Input, Select, Spin, } from 'antd'
import _ from 'lodash'
import { Client } from '../../core/clients'
import { CreateResource, UpdateResource } from 'hooks/useResources/interfaces'
import ResourceFormModal from 'components/ResourceFormModal'
import { useResources } from 'hooks/useResources'
import { User } from 'modules/admin/modules/client/core/users'
import range from 'lodash/range'
import { AdditionRelationshipAttribute } from 'libs/jsonApi/interfaces'

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
  const { data: projectManagers, fetch: fetchProjectManager, isLoading: isProjectManagerLoading } = useResources<User>('users')
  const { data: accountManagers, fetch: fetchAccountManager, isLoading: isAccountManagerLoading } = useResources<User>('users')
  const currentYear = new Date().getFullYear()
  const accountManagersForSelect = client?.accountManager ? accountManagers.concat(client.accountManager) : accountManagers
  const projectManagersForSelect = client?.projectManager ? projectManagers.concat(client.projectManager) : projectManagers

  return (
    <ResourceFormModal
      resourceName="clients"
      resource={client}
      readableResourceName="Client"
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      request={{
        createResource: addClient,
        updateResource: updateClient,
      }}
      jsonApiStandard
    >
      {({}) => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('administration.campaigns.form.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true }]}
          >
            <Select>
              {types.map(type => (
                <Option key={type} value={type}>{I18n.t(`activerecord.attributes.client.types.${type}`)}</Option>)
              )}
            </Select>
          </Form.Item>
          <Form.Item
            name="number"
            label="Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true }]}
          >
             <Select>
              {countries.map(country => (
                <Option key={country} value={country}>{country}</Option>)
              )}
            </Select>
          </Form.Item>
          <Form.Item
            name="year"
            label="Year"
            rules={[{ required: true }]}
          >
            <Select>
              {range(currentYear - 2, currentYear + 10).map(year => (<Option key={year} value={year}>{year}</Option>))}
            </Select>
          </Form.Item>
          <Form.Item
            name="accountManagerId"
            label="Account Manager"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              filterOption={false}
              onSearch={(value) => {
                fetchAccountManager({ apiConfig: { filter: { search_query: value }} })}
              }
              notFoundContent={isAccountManagerLoading('fetch') ? <Spin size="small" /> : null}
            >
              {accountManagersForSelect.map(({ id, name }) => (<Option key={id} value={id}>{name}</Option>))}
            </Select>
          </Form.Item>
          <Form.Item
            name="projectManagerId"
            label="Project Manager"
            rules={[{ required: true }]}
          >
           <Select
              showSearch
              onSearch={(value) => {
                fetchProjectManager({ apiConfig: { filter: { search_query: value }} })}
              }
              notFoundContent={isProjectManagerLoading('fetch') ? <Spin size="small" /> : null}
              filterOption={false}
            >
              {projectManagersForSelect.map(({ id, name }) => (<Option key={id} value={id}>{name}</Option>))}
            </Select>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
