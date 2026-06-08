import React, { useEffect } from 'react'
import {
  Table, Space, Input, Switch, Pagination, Button, MenuProps, App, Typography,
  Row,
  Col,
} from 'antd'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import { useResources } from '~/hooks/useResources'
import { UpdateResource, BaseMeta } from '~/hooks/useResources/interfaces'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import { RootState } from '~/modules/admin/core/rootReducers'
import { openModal } from '~/modules/admin/core/ui/modals'
import Modals from '~/modules/admin/components/Modals'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { get as getCurrentUser } from '~/core/currentUser'
import { Webhook, WebhookTR } from '~/modules/admin/modules/client/core/webhooks'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { AddEditWebhookModal } from './AddEditWebhookModal/AddEditWebhookModal'
import PushWebhookModal from '~/modules/admin/components/PushWebhookModal/PushWebhookModal'
import { truncateWithStartEndCharCount } from '~/utils/string'
import { useWindowSize } from '~/hooks/useWindowSize'

import { getClientId } from '~/modules/admin/modules/client/core/projects'

const MODALS = {
  AddEditWebhookModal,
  PushWebhookModal,
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
    clientId: getClientId(state),
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const { I18n } = window
const { Column } = Table

const WebhooksListComponent: React.FC<Props> = ({ openModal, clientId }) => {
  const { projectId } = useParams() as { projectId: string }

  const {
    data, meta, fetch, isLoading, getSortOrder, handleTableChange, changePage,
    currentPage, pageSize, changeFilter, getFilteredValue, createResource, updateResource,
    requests, removeResource,
  } = useResources<Webhook, BaseMeta>(
    'webhooks',
    {
      basePath: `projects/${projectId}`,
      trackUrl: true,
      responseType: WebhookTR,
    },
  )
  const { modal, message } = App.useApp()
  const { width: windowWidth } = useWindowSize()

  useEffect(() => {
    fetch()
  }, [])

  const tableLoading = isLoading('fetch')

  const toggleActive = (webhook) => {
    updateResource({
      id: webhook.id,
      active: !webhook.active,
    })
  }

  const removeWebhook = (webhook) => {
    modal.confirm({
      title: I18n.t('shared.delete'),
      content: I18n.t(
        'admin.project_tabs_webhooks_remove_webhook_content',
        {
          description: webhook.description,
        },
      ),
      okText: I18n.t('shared.ok'),
      cancelText: I18n.t(
        'shared.cancel',
      ),
      onOk: async () => {
        removeResource(`${webhook.id}`).then(() => {
          message.success(I18n.t('admin.webhook_delete_success'))
          close()
        }).catch((error) => {
          message.error(error)
        })
      },
    })
  }

  const WebhooksTable = (
    <>
      <Table
        dataSource={data}
        loading={tableLoading}
        onChange={handleTableChange}
        pagination={false}
        scroll={{ x: 'max-content' }}
      >
        <Column
          title={I18n.t('shared.id')}
          dataIndex="id"
          fixed={windowWidth > 800 ? 'left' : undefined}
          key="id"
          sorter
          sortOrder={getSortOrder('id')}
        />
        <Column
          key="active"
          title={I18n.t('admin.projects_webhook_settings_column_active')}
          render={webhook => <Switch checked={webhook.active} onChange={() => toggleActive(webhook)} />}
        />
        <Column
          key="description"
          title={I18n.t('admin.projects_webhook_settings_column_description')}
          dataIndex="description"
          sorter
          sortOrder={getSortOrder('description')}
        />
        <Column
          key="url"
          title={I18n.t('admin.projects_webhook_settings_column_url')}
          sorter
          sortOrder={getSortOrder('url')}
          render={({ url }) => (
            <>
              <Typography.Text
                copyable={{
                  text: url,
                }}
              >
                {truncateWithStartEndCharCount(url, 40, 40)}
              </Typography.Text>
            </>
          )}
        />
        <Column
          title={I18n.t('admin.projects_webhook_settings_column_created_date')}
          key="created_at"
          dataIndex="createdAt"
          sorter
          sortOrder={getSortOrder('created_at')}
        />
        <Column
          title={I18n.t('admin.projects_webhook_settings_column_updated_date')}
          key="updated_at"
          dataIndex="updatedAt"
          sorter
          sortOrder={getSortOrder('updated_at')}
        />
        <Column
          key="manage"
          fixed={windowWidth > 800 ? 'right' : undefined}
          title={I18n.t('shared.manage')}
          render={webhook => (
            <ConditionalDropdown
              menu={
                getActionsMenuProps({
                  webhook,
                  removeWebhook,
                  updateWebhook: updateResource,
                  openModal,
                  clientId,
                })
              }
            />
          )}
        />
      </Table>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={meta.recordCount}
        onChange={changePage}
        className="pl"
      />
    </>
  )

  const Filter = (
    <Space>
      <Input.Search
        placeholder={I18n.t('admin.projects_webhook_settings_search')}
        value={getFilteredValue('filterable_fields')}
        onChange={e => changeFilter('filterable_fields', e.target.value)}
      />
      <Button
        icon={<PlusOutlined />}
        type="primary"
        disabled={tableLoading}
        onClick={() => {
          openModal(
            'AddEditWebhookModal',
            {
              addWebhook: createResource,
              isEditMode: false,
              clientId,
            },
          )
        }}
      >
        {I18n.t('admin.projects_webhook_settings_add')}
      </Button>
    </Space>
  )

  return (
    <Row className="pl">
      <Col span={24}>
        <TableLayout
          table={WebhooksTable}
          filters={Filter}
          recordCount={meta.recordCount}
          loading={tableLoading}
          requestStatus={requests.fetch?.status}
          failureMsg={getErrorMsgFromJsonApiRequests(requests)}
        />
        <Modals modals={MODALS} />
      </Col>
    </Row>
  )
}

interface ActionMenuData {
  webhook: Webhook,
  removeWebhook(webhook: Webhook): void
  updateWebhook: UpdateResource<Webhook>
  openModal(name: string, data?: {
    webhook: Webhook,
    projectId?: number,
    updateWebhook?: UpdateResource<Webhook>,
    isEditMode?: boolean
    testMode?: boolean,
    clientId?: number,
  }),
  clientId: number,
}

const getActionsMenuProps = ({
  webhook, removeWebhook, openModal, updateWebhook, clientId,
}:ActionMenuData):MenuProps => {
  const menuItems: MenuItem[] = [
    {
      key: I18n.t('admin.project_tabs_webhooks_actions_edit_key'),
      label: I18n.t('shared.edit'),
    },
    {
      key: I18n.t('admin.project_tabs_webhooks_actions_delete_key'),
      label: I18n.t('shared.delete'),
    },
    {
      key: I18n.t('admin.project_tabs_webhooks_actions_send_test_key'),
      label: I18n.t('admin.project_tabs_webhooks_actions_send_test_label'),
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'delete') {
      removeWebhook(webhook)
    }
    if (key === 'send_test') {
      openModal('PushWebhookModal', {
        webhook, testMode: true, projectId: webhook.projectId,
      })
    }
    if (key === 'edit') {
      openModal(
        'AddEditWebhookModal', {
          updateWebhook,
          webhook,
          clientId,
        },
      )
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export const Webhooks = connecter(WebhooksListComponent)
