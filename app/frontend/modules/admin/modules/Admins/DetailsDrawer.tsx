import { FC, useEffect } from 'react'
import _ from 'lodash'
import {
  Drawer,
  Skeleton,
  Descriptions,
  Space,
  List,
  Button,
  Typography,
} from 'antd'
import { Link, useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import { AdminPermissions, ProjectAdminViewDetails } from '~/modules/admin/modules/client/core/admin'

const { I18n } = window

interface Props {
  isVisible: boolean
  adminId: string
  adminType: string
  permissions: AdminPermissions
  handleEdit: (id: string | undefined) => void
  handleClose: () => void
}

const DetailsDrawerComponent: FC<Props> = ({
  isVisible,
  adminId,
  adminType,
  permissions,
  handleClose,
  handleEdit,
}) => {
  const { projectId } = useParams<{ projectId: string }>()
  const { campaignId } = useParams<{ campaignId: string }>()

  const {
    fetchSingle, getResource, isLoading: isAdminLoading,
  } = useResources<ProjectAdminViewDetails>(
    'memberships',
    {
      apiConfig: {
        filter: {
          with_role: adminType,
          client_id_eq: projectId,
          campaign_id_eq: campaignId,
        },
      },
    },
  )

  const admin = getResource(adminId)

  useEffect(() => {
    if (isVisible) {
      fetchSingle({
        id: adminId,
      })
    }
  }, [adminId])

  return (
    <Drawer
      placement="right"
      onClose={handleClose}
      maskClosable
      closable={false}
      visible={isVisible}
      width="50%"
      zIndex={1001}
    >
      <Skeleton loading={isAdminLoading(`fetch@${adminId}`)} active>
        <Descriptions
          layout="horizontal"
          className="w-100"
          bordered
          column={1}
          extra={(
            <Space>
              {permissions?.edit && (
                <Button type="primary" onClick={() => handleEdit(admin?.id)}>
                  {I18n.t('administration.administrators.list.actions.edit')}
                </Button>
              )}
              <Button onClick={handleClose}>Close</Button>
            </Space>
          )}
          title={I18n.t(
            'administration.administrators.drawers.view.title_campaign',
          )}
        >
          <Descriptions.Item
            label={I18n.t('administration.administrators.drawers.view.first_name')}
            key="name"
          >
            {admin?.firstName ?? ''}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('administration.administrators.drawers.view.last_name')}
            key="name"
          >
            {admin?.lastName ?? ''}
          </Descriptions.Item>
          {admin?.email && (
            <Descriptions.Item
              label={I18n.t('administration.administrators.list.columns.email')}
              key="email"
            >
              {admin.email}
            </Descriptions.Item>
          )}
          {admin?.projects && (
            <Descriptions.Item
              label={I18n.t(
                'administration.administrators.list.columns.projects_list',
              )}
              key="projects_list"
              className="va-t"
            >
              <List
                itemLayout="horizontal"
                dataSource={admin.projects}
                renderItem={(permissionRole, index) => (
                  <List.Item
                    extra={(
                      <Typography.Text>
                        {_.startCase(permissionRole.role)}
                      </Typography.Text>
                    )}
                    className={index === 0 ? 'pt-0' : ''}
                  >
                    <List.Item.Meta
                      title={(
                        <Link
                          to={`/administration/projects/${permissionRole.id}/new_campaigns`}
                          className="ant-typography"
                        >
                          {permissionRole.name}
                        </Link>
                      )}
                    />
                  </List.Item>
                )}
              />
            </Descriptions.Item>
          )}
          {admin?.campaigns.length && (
            <Descriptions.Item
              label={I18n.t(
                'administration.administrators.list.columns.campaigns_list',
              )}
              key="campaigns_list"
              className="va-t"
            >
              <List
                itemLayout="horizontal"
                dataSource={admin.campaigns}
                renderItem={(permissionRole, index) => (
                  <List.Item
                    extra={(
                      <Typography.Text>
                        {_.startCase(permissionRole.role)}
                      </Typography.Text>
                    )}
                    className={index === 0 ? 'pt-0' : ''}
                  >
                    <List.Item.Meta
                      title={(
                        <Link
                          to={`new_campaigns/${permissionRole.id}`}
                          className="ant-typography"
                        >
                          {permissionRole.name}
                        </Link>
                      )}
                    />
                  </List.Item>
                )}
              />
            </Descriptions.Item>
          )}
        </Descriptions>
      </Skeleton>
    </Drawer>
  )
}

export const DetailsDrawer = DetailsDrawerComponent
