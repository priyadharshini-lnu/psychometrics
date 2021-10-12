import React, { FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Drawer,
  Skeleton,
  Descriptions,
  List,
  Space,
  Button,
  Typography,
} from 'antd'
import { Link } from 'react-router-dom'

import {
  fetchSingle as fetchAdmin,
  FETCH_SINGLE as FETCH_CAMPAIGN_SINGLE_ADMINS,
  getCurrent as getCurrentAdmin,
  Admin,
} from 'modules/admin/modules/Admins/core'
import { isRequestInProgress } from 'modules/admin/core/request'
import { RootState } from 'modules/admin/core/rootReducers'
import { ParentResourceType } from './constants'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    admin: getCurrentAdmin(state),
    isFetching: isRequestInProgress(state, FETCH_CAMPAIGN_SINGLE_ADMINS),
  }),
  {
    fetchAdmin,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  isVisible: boolean
  parentResourceType: ParentResourceType
  parentResourceId: number
  adminId: string
  projectId: number
  campaignId: number
  handleEdit: (id: Admin['id']) => void
  handleClose: () => void
}

type Props = OwnProps & PropsFromRedux

const DetailsDrawerComponent: FC<Props> = ({
  isVisible,
  parentResourceType,
  parentResourceId,
  adminId,
  projectId,
  campaignId,
  handleClose,
  handleEdit,
  admin,
  isFetching,
  fetchAdmin,
}) => {
  useEffect(() => {
    if (isVisible && adminId && adminId.length !== 0) {
      fetchAdmin(parentResourceType, parentResourceId, parseInt(adminId, 10))
    }
  }, [adminId, campaignId])

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
      <Skeleton loading={isFetching} active>
        <Descriptions
          layout="horizontal"
          className="w-100"
          bordered
          column={1}
          extra={(
            <Space>
              {admin?.permissions?.edit && (
                <Button type="primary" onClick={() => handleEdit(admin?.id ?? 0)}>
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
          {admin?.campaigns && (
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
                        {I18n.t('administration.administrators.drawers.view.role')}
                      </Typography.Text>
                    )}
                    className={index === 0 ? 'pt-0' : ''}
                  >
                    <List.Item.Meta
                      title={(
                        <Link
                          to={`/administration/projects/${projectId}/new_campaigns/${permissionRole.id}`}
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

export const DetailsDrawer = connector(DetailsDrawerComponent)
