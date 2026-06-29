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
  isOpen: boolean
  adminId: string
  adminType: string
  permissions: AdminPermissions
  handleEdit: (id: string | undefined) => void
  handleClose: () => void
}

const DetailsDrawerComponent: FC<Props> = ({
  isOpen,
  adminId,
  adminType,
  permissions,
  handleClose,
  handleEdit,
}) => {
  const { projectId, campaignId } = useParams() as { projectId: string, campaignId: string }

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
    if (isOpen) {
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
      open={isOpen}
      width="50%"
      zIndex={1001}
    >
      <Skeleton loading={isAdminLoading(`fetch@${adminId}`)} active>
        <Row>
          <Descriptions
            layout="horizontal"
            rootClassName="mb-6 w-100"
            bordered
            column={1}
            extra={(
              <Space>
                {permissions?.edit && (
                  <Button type="primary" onClick={() => handleEdit(admin?.id)}>
                    {I18n.t('shared.edit')}
                  </Button>
                )}
                <Button onClick={handleClose}>{I18n.t('shared.close')}</Button>
              </Space>
            )}
            title={I18n.t(
              `admin.${adminType}`,
            )}
          >
            <Descriptions.Item
              label={I18n.t('shared.first_name')}
              key="name"
              className="va-t w-30"
              labelStyle={{ width: '40%' }}
              contentStyle={{ width: '60%' }}
            >
              {admin?.firstName ?? ''}
            </Descriptions.Item>
            <Descriptions.Item
              label={I18n.t('shared.last_name')}
              key="name"
            >
              {admin?.lastName ?? ''}
            </Descriptions.Item>
            {admin?.email && (
              <Descriptions.Item
                label={I18n.t('shared.email')}
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
