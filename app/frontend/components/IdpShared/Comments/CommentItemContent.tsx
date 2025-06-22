import {
  Avatar, Divider, Flex, List, Space, Spin, Typography,
} from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { UserIdpComment } from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import { getUserName, formatDate } from './Utils'
import { CustomSender } from './CustomSender'
import { useCurrentUser } from './useCurrentUser'
import styles from './Comments.less'

const { I18n } = window

type CommentItemContentProps = {
  comment: UserIdpComment
  loadingReplies: boolean
  reply: string
  handleReplyChange: (value: string) => void
  handleSend: (value: string, commentId: string) => void
}

export const CommentItemContent = ({
  comment,
  loadingReplies,
  reply,
  handleReplyChange,
  handleSend,
}: CommentItemContentProps) => {
  const { isCurrentUser } = useCurrentUser()
  const isResolved = !!comment.resolvedAt || false
  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <Space
      direction="vertical"
      size={0}
      className={styles.commentContent}
    >
      {hasReplies && (
        <>
          <Divider className="mt-0 mb-6" />
          <List
            dataSource={comment.replies || []}
            split={false}
            renderItem={(reply: UserIdpComment) => {
              const isCurrentUserReply = isCurrentUser(reply.createdBy.id)
              const replyUserName = isCurrentUserReply ? I18n.t('idp.comments.you') : getUserName(reply.createdBy)

              return (
                <List.Item key={reply.id} className="pt-0 pb-4">
                  <Flex gap={8}>
                    <Avatar
                      src={reply.createdBy?.photo}
                      size={32}
                      style={{ flexShrink: 0 }}
                      icon={<UserOutlined />}
                    />
                    <Flex vertical>
                      <Flex gap={12}>
                        <Typography.Text style={{ fontSize: '0.75rem' }}>
                          {replyUserName}
                        </Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: '0.75rem' }}>
                          <Flex align="center" gap={4}>
                            <span>{I18n.t('idp.comments.replied')}</span>
                            <span>{formatDate(reply.createdAt)}</span>
                          </Flex>
                        </Typography.Text>
                      </Flex>
                      <Typography.Text style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                        {reply.content}
                      </Typography.Text>
                    </Flex>
                  </Flex>
                </List.Item>
              )
            }}
          />
        </>
      )}

      {!isResolved && !loadingReplies && (
        <div className="mt-2">
          <CustomSender
            value={reply}
            onChange={handleReplyChange}
            onSubmit={() => handleSend(reply, comment.id)}
            placeholder={I18n.t('idp.comment_details.add_reply_placeholder')}
            autoSize={{ minRows: 1, maxRows: 3 }}
            className={styles.inputSender}
          />
        </div>
      )}
      {isResolved && !loadingReplies && (
        <div className={`${styles.commentResolvedMessage} mt-2`}>
          <Typography.Text type="secondary" className={styles.commentResolvedText}>
            {I18n.t('idp.comments.resolved_message')}
          </Typography.Text>
        </div>
      )}
      {loadingReplies && comment.replies?.length === 0 && (
        <div className={styles.loadingContainer}>
          <Spin />
        </div>
      )}
    </Space>
  )
}
