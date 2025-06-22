import React from 'react'
import {
  Button,
  Popover,
  Tooltip,
} from 'antd'
import {
  MessageOutlined,
} from '@ant-design/icons'

import { Comments } from '~/components/IdpShared/Comments'
import { useSkillComments } from './useSkillsComments'

const { I18n } = window

interface SkillCommentPopoverProps {
  skillId: string
  skillName: string
}

export const SkillCommentsPopover: React.FC<SkillCommentPopoverProps> = ({
  skillId,
  skillName,
}) => {
  const {
    comments,
    handleAddComment,
    handleAddCommentReply,
    fetchComments,
    handleResolveComment,
    isLoading,
    handleToggleComments,
    selectedSkillId,
    handleUnresolveComment,
    totalCount,
  } = useSkillComments(skillId)

  const content = (
    <Comments
      comments={comments || []}
      totalCount={totalCount || 0}
      onAddComment={handleAddComment}
      onAddReply={handleAddCommentReply}
      onResolveComment={handleResolveComment}
      onUnresolveComment={handleUnresolveComment}
      onClose={() => handleToggleComments(null)}
      onFetchComments={fetchComments}
      subtitle={skillName}
      loading={isLoading}
      openFirstComment
      keyPrefix={`skill-${skillId}`}
      style={{
        width: 400,
        maxHeight: 600,
      }}
    />
  )

  return (
    <Popover
      arrow={false}
      content={content}
      trigger="click"
      open={selectedSkillId === skillId}
      onOpenChange={open => handleToggleComments(open ? skillId : null)}
      placement="leftTop"
      zIndex={999}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <Tooltip title={I18n.t('idp.comments.comments')}>
        <Button
          type="text"
          icon={<MessageOutlined />}
        />
      </Tooltip>
    </Popover>
  )
}
