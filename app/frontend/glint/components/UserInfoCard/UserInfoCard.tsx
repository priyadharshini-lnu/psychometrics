import React, { FC, useEffect } from 'react'
import { Button, Card, Tooltip } from 'antd'
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
}) => {
  const descrptionRef = React.useRef<HTMLDivElement>(null)
  const [descriptionOverflowing, setDescriptionOverflowing] = React.useState(false)

  useEffect(() => {
    setDescriptionOverflowing(descrptionRef.current
      ? descrptionRef.current.scrollWidth > descrptionRef.current.clientWidth : false)
  }, [email])

  return (
    <Card
      variant={bordered ? 'outlined' : 'borderless'}
      className={cs({ [styles.userInfoCard]: true, [styles.transparent]: transparent })}
      styles={{ body: { padding: '1rem' } }}
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
        description={(
          <>
            {descriptionOverflowing ? (
              <Tooltip placement="rightBottom" title={email}>
                <div ref={descrptionRef} className={styles.description}>{email}</div>
              </Tooltip>
            ) : <div ref={descrptionRef} className={styles.description}>{email}</div>}
          </>
        )}
      />
    </Card>
  )
}
