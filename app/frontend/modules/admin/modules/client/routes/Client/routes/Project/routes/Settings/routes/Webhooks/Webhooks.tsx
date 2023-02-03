import React from 'react'
import {
  Row, Col, Table, Space, Input, Switch, Pagination, Button,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'


import { CountDisplay } from '~/components/CountDisplay'
import { ActionsMenu } from './ActionsMenu'

const { I18n } = window

export const Webhooks: React.FC = () => (
  <>
    <Row justify="space-between" align="middle" className="pt-4 pb-4 ps-4 pe-4">
      <Col>
        <CountDisplay totalCount={0} />
      </Col>
      <Col>
        <Space>
          <Input.Search
            placeholder={I18n.t('administration.projects.webhook_settings.search')}
          />
          <Button
            icon={<PlusOutlined />}
            type="primary"
          >
            {I18n.t('administration.projects.webhook_settings.add')}
          </Button>
        </Space>
      </Col>
    </Row>
    <Row>
      <Col span={24}>
        <Table
          pagination={false}
          rowKey={row => row.id}
        >
          <Table.Column
            key="active"
            title={I18n.t('administration.projects.webhook_settings.column_active')}
            render={active => <Switch checked={active} onChange={() => null} />}
          />
          <Table.Column
            key="description"
            title={I18n.t('administration.projects.webhook_settings.column_description')}
          />
          <Table.Column
            key="url"
            title={I18n.t('administration.projects.webhook_settings.column_url')}
          />
          <Table.Column
            key="status"
            title={I18n.t('administration.projects.webhook_settings.column_status')}
          />
          <Table.Column
            key="manage"
            title={I18n.t('administration.projects.webhook_settings.column_manage')}
            render={() => (
              <ActionsMenu />
            )}
          />
        </Table>
      </Col>
    </Row>
    <Row className="pt-4 pb-4 ps-4 pe-4">
      <Col>
        <Pagination
          hideOnSinglePage
          total={0}
        />
      </Col>
    </Row>
  </>
)
