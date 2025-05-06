import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Button, message, MenuProps, Space, Checkbox, App,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { ConnectedProps, connect } from 'react-redux'
import _ from 'lodash'
import { MenuItem } from '~/interfaces/Antd'
import { AdminRole, AdminRoleTR } from '~/modules/admin/modules/client/core/adminRole'
import { AdminRolesForm } from './AdminRolesForm'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

const connector = connect(
  null,
  { openModal },
)
type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const AdminRolesList: React.FC<Props> = ({ openModal }) => {
  const { clientId } = useParams() as { clientId: string }
  const config = {
    responseType: AdminRoleTR,
    basePath: `clients/${clientId}`,
    apiConfig: {
      include_meta: ['permissions'],
    },
  }

  return (
    <Resource config={config} name="admin_roles">
      <ResourceFilter openModal={openModal} />
      <Resource.Table
        pagination
        expandable={{
          expandedRowRender: record => (
            <p className="ms-16">
              {_.map(record.permissions, (grants, permission) => (
                <Space direction="vertical" size="middle" className="w-30">
                  {_.startCase(permission)}
                  {Array.isArray(grants) && grants.map(grant => (
                    <Checkbox checked value={grant} key={grant as string}>
                      {I18n.t(`administration.administrators.permissions.labels.${permission}.${grant}`)}
                    </Checkbox>
                  ))}
                  <br />
                </Space>
              ))}
            </p>
          ),
          rowExpandable: record => _.some(record.permissions, grants => Array.isArray(grants) && grants.length),
        }}
      >
        <Resource.Column<AdminRole>
          title={I18n.t('administration.settings.admin_roles.name')}
          id="name"
        />
        <Resource.Column<AdminRole>
          title={I18n.t('administration.settings.admin_roles.description')}
          id="description"
        />
        <Resource.Column<AdminRole>
          title={I18n.t('common.column.action')}
          id="actions"
          key="actions"
          width="2%"
          render={role => (
            <ConditionalDropdown
              menu={
                getActionsMenuProps({
                  role,
                  openModal,
                })
              }
            />
          )}
        />
      </Resource.Table>
      <Modals modals={{ AdminRolesForm }} />
    </Resource>
  )
}

const ResourceFilter = ({ openModal }) => {
  const { resource } = useResourceContext<AdminRole>()
  const tableLoading = resource.isLoading('fetch')

  return (
    <Resource.Filter hideSearch name="">
      {resource.meta.permissions?.create && (
        <Button
          type="primary"
          disabled={tableLoading}
          onClick={() => openModal('AdminRolesForm')}
        >
          <PlusOutlined />
          {I18n.t('administration.settings.admin_roles.create')}
        </Button>
      )}
    </Resource.Filter>
  )
}

interface ActionMenuData {
  role: AdminRole
  openModal: (modalName: string, modalProps: unknown) => void
}

const getActionsMenuProps = ({
  role, openModal,
}: ActionMenuData):MenuProps => {
  const { resource } = useResourceContext<AdminRole>()
  const { modal } = App.useApp()

  const handleRemove = () => {
    modal.confirm({
      title: I18n.t('administration.administrators.modals.delete.title'),
      content: I18n.t(
        'administration.settings.admin_roles.confirm_message',
        { role_name: role.name },
      ),
      okText: I18n.t('administration.administrators.modals.delete.okText'),
      cancelText: I18n.t(
        'administration.administrators.modals.delete.cancelText',
      ),
      onOk: async () => {
        await resource.removeResource(role.id).then(() => {
          message.success(
            I18n.t('administration.settings.admin_roles.successful_remove', { role_name: role?.name }),
          )
        }).catch(() => {
          message.error(I18n.t('common.errors.something_wrong'))
        })
      },
    })
  }

  const menuItems: MenuItem[] = []
  resource.meta.permissions?.edit && menuItems.push({
    key: 'edit',
    label: (
      <Button
        type="link"
        onClick={
          () => openModal('AdminRolesForm', { role })
        }
        className="ps-0"
      >
        {I18n.t('common.actions.edit')}
      </Button>),
  })
  resource.meta.permissions?.remove && menuItems.push({
    key: 'remove',
    label: (
      <>
        <Button
          type="link"
          onClick={handleRemove}
          className="ps-0"
        >
          {I18n.t('common.actions.remove')}
        </Button>
      </>
    ),
  })

  return ({ items: menuItems })
}

export const AdminRoles = connector(AdminRolesList)
