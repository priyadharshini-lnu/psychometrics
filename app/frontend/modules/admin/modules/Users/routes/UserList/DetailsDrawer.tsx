import { FC } from 'react'
import {
  Drawer, Row, Descriptions,
} from 'antd'
import { User } from '~/modules/admin/modules/client/core/users'
import { UserRolesDetails } from '~/modules/admin/components/UserRolesDetails'


const { I18n } = window

interface Props {
  close: () => void
  user: User | undefined
}

export const DetailsDrawer: FC<Props> = ({
  close,
  user,
}) => {
  if (!user) {
    return null
  }

  return (
    <Drawer
      title={I18n.t('users.drawer.title')}
      placement="right"
      closable
      onClose={close}
      open
      width="40%"
    >
      <Row>
        <Descriptions
          layout="horizontal"
          className="mb-6 w-100"
          bordered
          column={1}
        >
          <Descriptions.Item
            label={I18n.t('common.column.id')}
            key="id"
            className="va-t w-30"
            labelStyle={{ width: '40%' }}
            contentStyle={{ width: '60%' }}
          >
            {user.id}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.first_name')} key="first_name" className="va-t">
            {user.firstName}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.last_name')} key="last_name" className="va-t">
            {user.lastName}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.email')} key="email" className="va-t">
            {user.email}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.updated_at')} key="updated_at" className="va-t">
            {user.updatedAt}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.created_by')} key="created_by" className="va-t">
            {user.createdBy}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.modified_by')} key="modified_by" className="va-t">
            {user.modifiedBy}
          </Descriptions.Item>
        </Descriptions>
      </Row>
      <Row>
        <UserRolesDetails userId={user.id} />
      </Row>
    </Drawer>
  )
}
