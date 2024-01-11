import React, { FC } from 'react'
import { Button, Card } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import cs from 'classnames'

import { ResourceAvatar } from '~/glint'

import styles from './UserInfoCard.less'

type SubjectCardProps = {
  nameLabel: string | React.ReactElement
  nameText: string
  id? : string | number
  email?: string | React.ReactElement
  avatarUrl?: string
  onRemove?: (id: string | number) => void
  bordered?: boolean
  transparent?: boolean
}

export const UserInfoCard: FC<SubjectCardProps> = ({
  nameLabel,
  nameText,
  id,
  email,
  avatarUrl,
  onRemove,
  bordered = true,
  transparent,
}) => (
  <Card
    bordered={bordered}
    className={cs({ [styles.userInfoCard]: true, [styles.transparent]: transparent })}
    bodyStyle={{ padding: '1rem', paddingRight: '3rem' }}
  >
    {onRemove ? (
      <Button
        type="text"
        data-testid={`remove-userinfo-${id}`}
        className={styles.remove}
        icon={<CloseOutlined />}
        onClick={() => onRemove(id || '')}
      />
    ) : null}
    <Card.Meta
      className={styles.meta}
      avatar={<ResourceAvatar name={nameText} size="large" src={avatarUrl} />}
      title={nameLabel}
      description={email}
    />
  </Card>
)
