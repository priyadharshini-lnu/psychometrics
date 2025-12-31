import React, { useContext, useEffect } from 'react'
import {
  Button,
} from 'antd'
import {
  MessageOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

import { Comments } from '~/components/IdpShared/Comments'
import { useSkillComments } from './useSkillsComments'
import { MediaQueryContext, BottomSheet } from '~/glint'

interface CommentsForSkillProps {
  skillForComment: { skillId: string, skillName: string } | null
  onClose?: () => void
  onScrollToSkill?: (resourceId: string) => void
}

export const CommentsForSkill: React.FC<CommentsForSkillProps> = ({
  skillForComment,
  onClose,
  onScrollToSkill,
}) => {
  const [skill, setSkill] = React.useState(skillForComment || null)

  useEffect(() => {
    setSkill(skillForComment)
  }, [skillForComment])

  const {
    comments,
    handleAddComment,
    handleAddCommentReply,
    fetchComments,
    handleResolveComment,
    isLoading,
    handleToggleComments,
    handleUnresolveComment,
    totalCount,
  } = useSkillComments(skill?.skillId ?? '')

  const { isMobile } = useContext(MediaQueryContext)

  const onTagClear = () => {
    setSkill(null)
  }

  const content = (
    <Comments
      comments={comments || []}
      totalCount={totalCount || 0}
      onAddComment={handleAddComment}
      onAddReply={handleAddCommentReply}
      onResolveComment={handleResolveComment}
      onUnresolveComment={handleUnresolveComment}
      onClose={() => { handleToggleComments(null); onClose?.() }}
      onFetchComments={fetchComments}
      filteredSkillId={skill?.skillId}
      subtitle={skill?.skillName}
      loading={isLoading}
      onTagClear={onTagClear}
      openFirstComment
      keyPrefix={`skill-${skill?.skillId}`}
      style={{
        width: 400,
        maxHeight: 600,
      }}
      onScrollToSkill={onScrollToSkill}
    />
  )

  if (isMobile) {
    return (
      <>
        <Button
          type="text"
          icon={<MessageOutlined />}
          onClick={() => handleToggleComments((skill as {
            skillId: string;
            skillName: string;
          })?.skillId)}
        />
        <BottomSheet isOpen={Boolean(skill?.skillId)}>{content}</BottomSheet>
      </>
    )
  }

  return content
}
