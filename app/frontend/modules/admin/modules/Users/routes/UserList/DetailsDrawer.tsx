import { FC, useEffect, useState } from 'react'
import * as t from 'io-ts'
import {
  Drawer, Row, Descriptions, Skeleton,
} from 'antd'
import { User } from '~/modules/admin/modules/client/core/users'
import { useResourceContext } from '~/modules/admin/components/Resource'

export const RoleTR = t.type({
  name: t.string,
  paths: t.array(t.type({
    name: t.string,
    value: t.string,
  })),
})

export const RolesResponseTR = t.type({
  roles: t.array(RoleTR),
})

const { I18n } = window

interface Props {
  close: () => void
  user: User | undefined
}

type Role = t.TypeOf<typeof RoleTR>

interface RolesResponse {
  roles: Role[]
}

export const DetailsDrawer: FC<Props> = ({
  close,
  user,
}) => {
  const { resource } = useResourceContext()
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)

  if (!user) {
    return null
  }

  useEffect(() => {
    getRoles(user)
  }, [user])

  const getRoles = (user: User) => resource.memberAction({
    id: user.id,
    action: 'roles',
    method: 'get',
    responseType: RolesResponseTR,
  }).then((response: RolesResponse) => {
    setRoles(response.roles)
    setIsLoading(false)
  })


  return (
    <Drawer
      title={I18n.t('users.drawer.title')}
      placement="right"
      closable
      onClose={close}
      visible
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
        <Skeleton loading={isLoading} active>
          <Descriptions
            layout="horizontal"
            className="mb-6 w-100"
            bordered
            column={1}
          >
            <Descriptions.Item
              labelStyle={{ fontWeight: 'bold', width: '40%' }}
              contentStyle={{ fontWeight: 'bold', width: '60%' }}
              label={I18n.t('users.drawer.role')}
              key="id"
              className="va-t w-30"
            >
              {I18n.t('users.drawer.link')}
            </Descriptions.Item>
            {!roles.length
              && (
                <Descriptions.Item span={2}>
                  Empty
                </Descriptions.Item>
              )}
            {roles.map((role, index) => (
              <Descriptions.Item
                label={I18n.t(`users.roles.${role.name}`)}
                key={index}
                className="va-t"
              >
                {role.paths.map((path, i) => (
                  <>
                    {i > 0 && <span> &gt; </span>}
                    <a href={path.value}>{path.name}</a>
                  </>
                ))}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Skeleton>
      </Row>
    </Drawer>
  )
}
