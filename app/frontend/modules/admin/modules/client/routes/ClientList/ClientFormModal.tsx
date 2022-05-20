import React, { FC, ReactElement, useEffect, useState } from 'react'
import { Form, Input, Select, } from 'antd'
import _ from 'lodash'
import { Client } from '../../core/clients'
import { CreateResource } from 'hooks/useResources/interfaces'
import ResourceFormModal from 'components/ResourceFormModal'
import { useResources } from 'hooks/useResources'

const { I18n } = window

interface Props {
  client: undefined
  addClient: CreateResource<Client>
  close(): void
}

export const ClientFormModal: React.FC<Props> = ({
  client,
  addClient,
  close,
}) => {
  return (
    <ResourceFormModal
      resourceName="clients"
      readableResourceName="Client"
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      request={{
        createResource: addClient
      }}
    >
      {({}) => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('administration.campaigns.form.name')}
            // rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="number"
            label="Number"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="country"
            label="Country"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="year"
            label="Year"
          >
            <Select>
              {[2000, 2001].map(year => (<Select.Option key={year} value={year}>{year}</Select.Option>))}
            </Select>
          </Form.Item>
          <Form.Item
            name="accountManagerId"
            label="Account Manager"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="projectManagerId"
            label="Project Manager"
          >
            <Input />
          </Form.Item>
        </>
  )}
    </ResourceFormModal>
  )
}
