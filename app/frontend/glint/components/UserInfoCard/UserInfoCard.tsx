import React, { FC } from 'react'
import { Card, List } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

import { ResourceAvatar } from '~/glint'

import styles from './UserInfoCard.less'

type SubjectCardProps = {
  nameLabel: string | React.ReactElement
  nameText: string
  id? : string | number
  email?: string | React.ReactElement
  avatarUrl?: string
  onRemove?: (id: string | number) => void
}

export const UserInfoCard: FC<SubjectCardProps> = ({
  nameLabel,
  nameText,
  id,
  email,
  avatarUrl,
  onRemove,
}) => (
  <Card className={styles.userInfoCard} bodyStyle={{ padding: 8 }}>
    {onRemove ? (
      <div
        data-testid={`remove-userinfo-${id}`}
        className={styles.remove}
        onClick={() => onRemove(id || '')}
      >
        <CloseOutlined />
      </div>
    ) : null}
    <List.Item.Meta
      className={styles.meta}
      avatar={<ResourceAvatar name={nameText} size="large" src={avatarUrl} />}
      title={nameLabel}
      description={email}
    />
  </Card>
)
