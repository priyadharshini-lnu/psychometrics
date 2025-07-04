import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import {
  addUserIdpComment,
  addUserIdpCommentReplyBySkillId,
  fetchUserIdpCommentBySkillId,
  UserIdpCommentPayload,
  UserIdpCommentReplyPayload,
  markCommentResolved,
  showCommentsForSkillId,
  markCommentUnresolved,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { Filters, Pagination } from '../Comments'

export const useSkillComments = (skillId: string) => {
  const dispatch = useDispatch()
  const comments = useSelector((state: RootState) => state.campaigns.idp.userIdpCommentsBySkillId?.[skillId])
  const idpUserId = useSelector((state: RootState) => state.campaigns.idp.user?.id)
  const selectedSkillId = useSelector((state: RootState) => state.campaigns.idp.showCommentsForSkillId)
  const totalCount = useSelector((
    state: RootState,
  ) => state.campaigns.idp.userIdpCommentsBySkillIdTotalCount?.[skillId])
  const [isLoading, setIsLoading] = useState(false)
  const handleAddComment = (content: string) => {
    const comment: UserIdpCommentPayload = {
      content,
      resourceId: skillId,
      resourceType: 'UserIdpSkill',
    }
    dispatch(addUserIdpComment(idpUserId, comment))
  }

  const fetchComments = (
    filters: Filters = {},
    pagination: Pagination = { page: 1, pageSize: 5 },
  ) => {
    setIsLoading(true)
    const queryParams: Record<string, string | boolean | undefined> = {
      resourceIdEq: skillId,
      resourceTypeEq: 'UserIdpSkill',
    }

    if (filters?.showResolved) queryParams.resolvedEq = true
    if (filters?.showUnread) queryParams.unreadByUser = true
    if (filters?.showRead) queryParams.unreadByUser = false
    if (filters?.showUnresolved) queryParams.resolvedEq = false
    queryParams.s = `created_at ${filters?.sortOrder || 'desc'}`
    dispatch(fetchUserIdpCommentBySkillId(idpUserId, skillId, {
      q: queryParams,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })).then(() => {
      setIsLoading(false)
    }).catch(() => {
      setIsLoading(false)
    })
  }

  const handleAddCommentReply = (content: string, parentId: string) => {
    const reply: UserIdpCommentReplyPayload = { content, parentId }
    dispatch(addUserIdpCommentReplyBySkillId(idpUserId, skillId, reply))
  }

  const handleResolveComment = (commentId: string) => {
    dispatch(markCommentResolved(idpUserId, commentId))
  }

  const handleUnresolveComment = (commentId: string) => {
    dispatch(markCommentUnresolved(idpUserId, commentId))
  }

  const handleToggleComments = (skillId: string | null) => {
    dispatch(showCommentsForSkillId(skillId))
  }

  return {
    comments,
    handleAddComment,
    handleAddCommentReply,
    fetchComments,
    handleResolveComment,
    isLoading,
    showCommentsForSkillId,
    selectedSkillId,
    handleToggleComments,
    handleUnresolveComment,
    totalCount,
  }
}
