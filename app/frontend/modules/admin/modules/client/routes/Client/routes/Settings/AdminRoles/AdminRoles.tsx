import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Button, message, MenuProps, Space, Checkbox, App,
} from 'antd'
import { ConnectedProps, connect } from 'react-redux'
import _ from 'lodash'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import { AdminRole, AdminRoleTR } from '~/modules/admin/modules/client/core/adminRole'
import { AdminRolesForm } from './AdminRolesForm'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
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
    <Resource
      title={I18n.t('admin.settings_tabs_admin_roles')}
      config={config}
      name="admin_roles"
      settingsKey={TABLE_SETTINGS_KEYS.clientSettingsAdminRoles}
    >
      <ResourceFilter openModal={openModal} />
      <Resource.Table
        pagination
        expandable={{
          expandedRowRender: record => (
            <p className="ms-16">
              {_.map(record.permissions, (grants, permission) => (
                <Space orientation="vertical" size="middle" className="w-30">
                  {_.startCase(permission)}
                  {Array.isArray(grants) && grants.map(grant => (
                    <Checkbox checked value={grant} key={grant as string}>
                      {I18n.t(`admin.permissions.${permission}.${grant}`)}
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
          title={I18n.t('shared.name')}
          id="name"
          hideable={false}
        />
        <Resource.Column<AdminRole>
          title={I18n.t('shared.description')}
          id="description"
        />
        <Resource.Column<AdminRole>
          title={I18n.t('shared.action')}
          id="actions"
          hideable={false}
          key="actions"
          width={100}
          fixed="right"
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
          {I18n.t('admin.add_admin_role')}
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
      title: I18n.t('shared.confirm'),
      content: I18n.t(
        'admin.settings_admin_roles_confirm_message',
        { role_name: role.name },
      ),
      okText: I18n.t('shared.ok'),
      cancelText: I18n.t(
        'shared.cancel',
      ),
      onOk: async () => {
        await resource.removeResource(role.id).then(() => {
          message.success(
            I18n.t('admin.admin_role_deleted', { role_name: role?.name }),
          )
        }).catch(() => {
          message.error(I18n.t('shared.something_wrong'))
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
        {I18n.t('shared.edit')}
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
          {I18n.t('shared.remove')}
        </Button>
      </>
    ),
  })

  return ({ items: menuItems })
}

export const AdminRoles = connector(AdminRolesList)
