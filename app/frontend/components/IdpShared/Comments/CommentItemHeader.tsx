import {
  Avatar, Badge, Button, Flex, Tooltip, Typography,
} from 'antd'
import { UserIdpComment } from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import { ArrowRightOutlined, CheckOutlined, UserOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { getUserName, formatDate } from './Utils'
import { useCurrentUser } from '~/hooks/useCurrentUser'
import styles from './Comments.less'

const { I18n } = window

type CommentItemHeaderProps = {
  comment: UserIdpComment
  onResolveComment: (commentId: string) => void
  onUnresolveComment: (commentId: string) => void
  onScrollToSkill?: (resourceId: string) => void
}

export const CommentItemHeader = ({
  comment,
  onResolveComment,
  onUnresolveComment,
  onScrollToSkill,
}: CommentItemHeaderProps) => {
  const { isCurrentUser } = useCurrentUser()
  const isCurrentUserComment = isCurrentUser(comment.createdBy.id)
  const userName = isCurrentUserComment ? I18n.t('idp.comments.you') : getUserName(comment.createdBy)
  const isResolved = !!comment.resolvedAt || false
  const repliesCount = comment.repliesCount || 0

  return (
    <>
      <div className={styles.commentItemTopSpacer} />
      <Flex
        vertical
        gap={12}
        className={styles.commentItemHeader}
      >
        <Flex align="start" gap={8} justify="space-between" style={{ width: '100%' }}>
          <Flex align="center" gap={8}>
            <Avatar
              src={comment.createdBy?.photo}
              size={32}
              icon={<UserOutlined />}
              aria-hidden="true"
            />
            <Flex vertical>
              <Typography.Text style={{ fontSize: '0.75rem' }}>
                <span className="sr-only">
                  {I18n.t('idp.comments.commented_by')}
                </span>
                {userName}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                style={{ fontSize: '0.75rem' }}
              >
                <span className="sr-only">
                  {I18n.t('idp.comments.commented_at')}
                </span>
                {formatDate(comment.createdAt)}
              </Typography.Text>
            </Flex>
          </Flex>
          {!isResolved ? (
            <Tooltip title={I18n.t('idp.comments.mark_as_resolved')}>
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  onResolveComment(comment.id)
                }}
                aria-label={I18n.t('idp.comments.mark_comment_as_resolved')}
                iconPlacement="end"
              >
                {I18n.t('idp.comments.resolve')}
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title={I18n.t('idp.comments.mark_as_unresolved')}>
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                className={styles.commentResolvedButton}
                iconPlacement="end"
                onClick={(e) => {
                  e.stopPropagation()
                  onUnresolveComment(comment.id)
                }}
              >
                {I18n.t('idp.comments.resolved')}
              </Button>
            </Tooltip>
          )}
        </Flex>
        <Typography.Text
          style={{
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          <span className="sr-only">
            {I18n.t('idp.comments.comment_content')}
          </span>
          {comment.content}
        </Typography.Text>
        <Flex gap={0} justify="space-between" style={{ flex: 1 }}>
          {repliesCount ? (
            <Badge
              aria-label={I18n.t('idp.comments.unread_replies_count')}
              count={comment.unreadRepliesCount}
              size="small"
              color="primary"
            >
              <Button type="link" size="small" className="p-0">
                <Flex align="center" gap={2}>
                  <span>{repliesCount || 0}</span>
                  <span>{repliesCount === 1 ? I18n.t('idp.comments.reply') : I18n.t('idp.comments.replies')}</span>
                </Flex>
              </Button>
            </Badge>
          ) : null}
          {!isResolved && !repliesCount ? (
            <Button
              type="link"
              size="small"
              className="p-0"
            >
              {I18n.t('idp.comments.reply')}
            </Button>
          ) : <span />}
          {comment.resourceId && comment.resourceType === 'UserIdpSkill' && onScrollToSkill && (
            <Flex justify="end">
              <Button
                type="link"
                size="small"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onScrollToSkill(comment.resourceId)
                }}
                icon={<ArrowRightOutlined />}
                iconPlacement="end"
              >
                {I18n.t('idp.comment_details.go_to_skill')}
              </Button>
            </Flex>
          )}
        </Flex>
      </Flex>
    </>
  )
}
