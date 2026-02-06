import { FC, useState } from 'react'
import {
  Row, Col, Avatar, Dropdown, Typography, Space, Input, Button, Modal,
} from 'antd'
import cs from 'classnames'
import _ from 'lodash'
import {
  MoreOutlined, UserOutlined, ExclamationCircleOutlined, CheckOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import dayjs from '~/utils/dayjs'
import styles from './CommentItem.less'

type Props = {
  canEdit?: boolean,
  canRemove?: boolean,
  canResolve?: boolean,
  comment: {
    id: string
    text: string
    createdAt: string
    resolved: boolean
    isNew?: boolean
    creator: {
      fullName: string,
      avatarUrl?: string | null,
    }
  }
  onCommentRemove?:(commentId: string) => void
  onCommentResolve?: (commentId: string, resolved: boolean) => void
  onCommentEditSave?: (comment: {commentText: string, commentId: string}) => Promise<unknown>
  onRead?: (commentId: string) => void
}

const { Text } = Typography
const { confirm } = Modal
const { TextArea } = Input
const { I18n } = window

export const CommentItem: FC<Props> = ({
  canEdit, canRemove, canResolve, comment, comment: { creator },
  onCommentRemove, onCommentEditSave, onCommentResolve, onRead,
}) => {
  const [commentText, setCommentText] = useState(comment.text)
  const [editComment, setEditComment] = useState(false)
  const menuItems: MenuItem[] = [
    canEdit ? { key: 'edit', label: I18n.t('common.actions.edit') } : null,
    canRemove ? { key: 'remove', label: I18n.t('common.actions.remove') } : null,
    canResolve && comment.resolved ? { key: 'resolve', label: I18n.t('common.actions.unresolve') } : null,
    canResolve && !comment.resolved ? { key: 'resolve', label: I18n.t('common.actions.resolve') } : null,
  ]
  const showConfirm = () => {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: I18n.t('confirmation.delete_comment'),
      okText: I18n.t('common.actions.delete'),
      onOk () {
        onCommentRemove && onCommentRemove(comment.id)
      },
      zIndex: 9999,
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
      onCommentResolve && onCommentResolve(comment.id, comment.resolved)
    }
  }
  const avatarIcon = creator.avatarUrl ? null : <UserOutlined />
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
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <div
      data-testid="comment-item"
      onMouseOver={() => comment.isNew && onRead && onRead(comment.id)}
      className={cs(styles.topRow, { [styles.new]: comment.isNew })}
    >
      <Row wrap={false} gutter={[6, 0]} justify="center" align="middle">
        <Col>
          <Avatar size={40} icon={avatarIcon} src={creator.avatarUrl} />
        </Col>
        <Col flex={1}>
          <Text className={styles.timestamp} type="secondary">{dayjs(comment.createdAt).fromNow(true)}</Text>
          <div className={styles.name}>{creator.fullName}</div>
        </Col>
        {comment.resolved && (
          <Col>
            <CheckOutlined className={styles.resolved} />
          </Col>
        )}
        {_.some(menuItems) && (
          <div className={styles.actionMenu}>
            <Dropdown
              trigger={['click']}
              menu={{ items: menuItems, onClick: handleMenuClick }}
            >
              <a>
                <MoreOutlined data-testid="more-options" className={styles.triggerIcon} />
              </a>
            </Dropdown>
          </div>
        )}
      </Row>
      <div className={styles.textRow}>
        {editComment ? (
          <>
            <TextArea autoSize size="small" onChange={handleCommentEdit} value={commentText} />
            <Space orientation="horizontal" className={styles.btnContainer}>
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
