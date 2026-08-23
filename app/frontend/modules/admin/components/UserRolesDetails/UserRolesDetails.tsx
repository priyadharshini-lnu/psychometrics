import { User } from 'modules/admin/modules/client/core/users'
import { useEffect, useState, FC } from 'react'
import * as t from 'io-ts'
import { Descriptions, Skeleton } from 'antd'
import { Link } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import { useIsOwnedPath } from '~/components/AdminShell/ownedPaths'

interface Props {
  userId: string
}

export const RoleTR = t.type({
  name: t.string,
  paths: t.array(t.type({
    name: t.string,
    value: t.string,
  })),
})

type Role = t.TypeOf<typeof RoleTR>

export const RolesResponseTR = t.type({
  roles: t.array(RoleTR),
})

interface RolesResponse {
  roles: Role[]
}

const { I18n } = window

export const UserRolesDetails: FC<Props> = ({ userId }) => {
  const isOwned = useIsOwnedPath()
  const {
    memberAction,
  } = useResources<User>('users')

  useEffect(() => {
    if (userId) {
      getRoles(userId)
    }
  }, [userId])

  const [roles, setRoles] = useState<Role[]>([])
  const [isRolesLoading, setIsRolesLoading] = useState(true)

  const getRoles = (userId: string) => memberAction({
    id: userId,
    action: 'roles',
    method: 'get',
    responseType: RolesResponseTR,
  }).then((response: RolesResponse) => {
    setRoles(response.roles)
    setIsRolesLoading(false)
  })

  return (
    <Skeleton loading={isRolesLoading} active>
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
            )
        }
        {roles.map((role, index) => (
          <Descriptions.Item
            label={I18n.t(`users.roles.${role.name}`)}
            key={index}
            className="va-t"
          >
            {role.paths.map((path, i) => (
              <>
                {i > 0 && <span> &gt; </span>}
                {isOwned(path.value)
                  ? <Link to={path.value}>{path.name}</Link>
                  : <a href={path.value}>{path.name}</a>}
              </>
            ))}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Skeleton>
  )
}
