import React, { FC, useState } from 'react'
import {
  Row, Col, Avatar, Dropdown, Menu, Typography, Space, Input, Button, Modal,
} from 'antd'
import { MoreOutlined, UserOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

import { ItemType } from 'antd/lib/menu/hooks/useItems'
import styles from './CommentItem.less'

type Props = {
  canEdit?: boolean,
  canRemove?: boolean,
  canResolve?: boolean,
  comment: {
    id: string
    text: string,
    createdAt: string,
  }
  userData: {
    fullName: string,
    avatarUrl?: string | null,
  }
  onCommentRemove?:(commentId: string) => null
  onCommentResolve?: (commentId: string) => null
  onCommentEditSave?: (comment: {commentText: string, commentId: string}) => Promise<unknown>
}

const { Text } = Typography
const { confirm } = Modal
const { TextArea } = Input
const { I18n } = window

export const CommentItem: FC<Props> = ({
  canEdit, canRemove, canResolve, comment, userData, onCommentRemove, onCommentEditSave, onCommentResolve,
}) => {
  const [commentText, setCommentText] = useState(comment.text)
  const [editComment, setEditComment] = useState(false)
  const menuItems: ItemType[] = [
    canEdit ? { key: 'edit', label: I18n.t('common.actions.edit') } : null,
    canRemove ? { key: 'remove', label: I18n.t('common.actions.remove') } : null,
    canResolve ? { key: 'resolve', label: I18n.t('common.actions.resolve') } : null,
  ]
  const showConfirm = () => {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: I18n.t('confirmation.delete_comment'),
      okText: I18n.t('common.actions.delete'),
      onOk () {
        onCommentRemove && onCommentRemove(comment.id)
      },
    })
  }

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      setEditComment(true)
    }
    if (key === 'remove') {
      showConfirm()
    }
    if (key === 'resolve') {
      onCommentResolve && onCommentResolve(comment.id)
    }
  }
  const menu = <Menu items={menuItems} onClick={handleMenuClick} />
  const avatarIcon = userData.avatarUrl ? null : <UserOutlined />
  const handleSave = () => {
    onCommentEditSave && onCommentEditSave({ commentText, commentId: comment.id }).then(() => {
      setEditComment(false)
    })
  }
  const handleCancelEdit = () => {
    setEditComment(false)
  }
  const handleCommentEdit = ({ target }) => {
    setCommentText(target.value)
  }
  return (
    <div className={styles.topRow}>
      <Row wrap={false} gutter={[6, 0]} justify="center">
        <Col>
          <Avatar size={40} icon={avatarIcon} src={userData.avatarUrl} />
        </Col>
        <Col flex={1}>
          <Text className={styles.timestamp} type="secondary">{comment.createdAt}</Text>
          <div className={styles.name}>{userData.fullName}</div>
        </Col>
        <div className={styles.actionMenu}>
          <Dropdown
            trigger={['click']}
            overlay={menu}
          >
            <a>
              <MoreOutlined className={styles.triggerIcon} />
            </a>
          </Dropdown>
        </div>
      </Row>
      <div className={styles.textRow}>
        {editComment ? (
          <>
            <TextArea autoSize size="small" onChange={handleCommentEdit} value={commentText} />
            <Space direction="horizontal" className={styles.btnContainer}>
              <Button size="small" onClick={handleCancelEdit}>{I18n.t('common.actions.cancel')}</Button>
              <Button
                disabled={!commentText.length}
                size="small"
                type="primary"
                onClick={handleSave}
              >
                {I18n.t('common.actions.save')}
              </Button>
            </Space>
          </>
        )
          : comment.text}
      </div>
    </div>
  )
}
