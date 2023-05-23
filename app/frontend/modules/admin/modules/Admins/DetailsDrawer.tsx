import { FC, useEffect } from 'react'
import {
  Drawer,
  Skeleton,
  Descriptions,
  Space,
  Button,
  Row,
} from 'antd'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import { AdminPermissions, ProjectAdminViewDetails } from '~/modules/admin/modules/client/core/admin'
import { UserRolesDetails } from '~/modules/admin/components/UserRolesDetails'

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

  useEffect(() => {
    if (isVisible) {
      fetchSingle({
        id: adminId,
      })
    }
  }, [adminId])

  const admin = getResource(adminId)

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
        <Row>
          <Descriptions
            layout="horizontal"
            className="mb-6 w-100"
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
              `administration.administrators.drawers.view.title.${adminType}`,
            )}
          >
            <Descriptions.Item
              label={I18n.t('administration.administrators.drawers.view.first_name')}
              key="name"
              className="va-t w-30"
              labelStyle={{ width: '40%' }}
              contentStyle={{ width: '60%' }}
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
          </Descriptions>
        </Row>
      </Skeleton>
      <Row>
        {admin?.userId && <UserRolesDetails userId={admin?.userId} />}
      </Row>
    </Drawer>
  )
}

export const DetailsDrawer = DetailsDrawerComponent
