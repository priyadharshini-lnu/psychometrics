import React, { useEffect } from 'react'
import {
  Table, Space, Input, Switch, Pagination, Button, MenuProps, App, Typography,
} from 'antd'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { PlusOutlined } from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { useResources } from '~/hooks/useResources'
import { UpdateResource, BaseMeta } from '~/hooks/useResources/interfaces'
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

const MODALS = {
  AddEditWebhookModal,
  PushWebhookModal,
}

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

const { I18n } = window
const { Column } = Table

const WebhooksListComponent: React.FC<Props> = ({ openModal }) => {
  const { projectId } = useParams<{ projectId: string }>()

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
      title: I18n.t('administration.project_tabs.webhooks.remove_webhook.title'),
      content: I18n.t(
        'administration.project_tabs.webhooks.remove_webhook.content',
        {
          description: webhook.description,
        },
      ),
      okText: I18n.t('administration.administrators.modals.delete.okText'),
      cancelText: I18n.t(
        'administration.administrators.modals.delete.cancelText',
      ),
      onOk: async () => {
        removeResource(`${webhook.id}`).then(() => {
          message.success(I18n.t('administration.webhook.delete_success'))
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
      >
        <Column
          title={I18n.t('common.column.id')}
          dataIndex="id"
          key="id"
          sorter
          sortOrder={getSortOrder('id')}
        />
        <Column
          key="active"
          title={I18n.t('administration.projects.webhook_settings.column_active')}
          render={webhook => <Switch checked={webhook.active} onChange={() => toggleActive(webhook)} />}
        />
        <Column
          key="description"
          title={I18n.t('administration.projects.webhook_settings.column_description')}
          dataIndex="description"
          sorter
          sortOrder={getSortOrder('description')}
        />
        <Column
          key="url"
          title={I18n.t('administration.projects.webhook_settings.column_url')}
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
          title={I18n.t('administration.projects.webhook_settings.column_created_date')}
          key="created_at"
          dataIndex="createdAt"
          sorter
          sortOrder={getSortOrder('created_at')}
        />
        <Column
          title={I18n.t('administration.projects.webhook_settings.column_updated_date')}
          key="updated_at"
          dataIndex="updatedAt"
          sorter
          sortOrder={getSortOrder('updated_at')}
        />
        <Column
          key="manage"
          title={I18n.t('administration.projects.webhook_settings.column_manage')}
          render={webhook => (
            <ConditionalDropdown
              menu={
                getActionsMenuProps({
                  webhook,
                  removeWebhook,
                  updateWebhook: updateResource,
                  openModal,
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
        placeholder={I18n.t('administration.projects.webhook_settings.search')}
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
            },
          )
        }}
      >
        {I18n.t('administration.projects.webhook_settings.add')}
      </Button>
    </Space>
  )

  return (
    <>
      <TableLayout
        table={WebhooksTable}
        filters={Filter}
        recordCount={meta.recordCount}
        loading={tableLoading}
        requestStatus={requests.fetch?.status}
      />
      <Modals modals={MODALS} />
    </>
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
    testMode?: boolean
  })
}

const getActionsMenuProps = ({
  webhook, removeWebhook, openModal, updateWebhook,
}:ActionMenuData):MenuProps => {
  const menuItems: ItemType[] = [
    {
      key: I18n.t('administration.project_tabs.webhooks.actions.edit.key'),
      label: I18n.t('administration.project_tabs.webhooks.actions.edit.label'),
    },
    {
      key: I18n.t('administration.project_tabs.webhooks.actions.delete.key'),
      label: I18n.t('administration.project_tabs.webhooks.actions.delete.label'),
    },
    {
      key: I18n.t('administration.project_tabs.webhooks.actions.send_test.key'),
      label: I18n.t('administration.project_tabs.webhooks.actions.send_test.label'),
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
        },
      )
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export const Webhooks = connecter(WebhooksListComponent)
