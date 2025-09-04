import { USER_IDP_PLAN_STATUS } from 'components/IdpShared/constants'
import { Skill, DevelopmentAction } from 'components/IdpShared/DevelopmentActions'
import _ from 'lodash'
import ApiAction from 'interfaces/ApiAction'
import * as t from 'io-ts'
import { getRequestQuery, updateUserIdpSkillComments } from './utils'
import { FetchSkillGapsResponse } from
  '~/modules/endUser/modules/campaigns/core/idp/idpForm'

export const FETCH_USER_IDP_PLAN = 'IDP/MY_PLAN/FETCH_USER_IDP_PLAN'
const UPDATE_USER_IDP_PLAN = 'IDP/MY_PLAN/UPDATE_USER_IDP_PLAN'
const FETCH_USER_IDP_DEVELOPMENT_ACTIONS = 'IDP/MY_PLAN/FETCH_USER_IDP_DEVELOPMENT_ACTIONS'
const FETCH_USER_IDP_SKILLS = 'IDP/MY_PLAN/FETCH_USER_IDP_SKILLS'
const FETCH_AVAILABLE_DEVELOPMENT_ACTIONS = 'IDP/MY_PLAN/FETCH_AVAILABLE_DEVELOPMENT_ACTIONS'
const GENERATE_DEVELOPMENT_ACTIONS_BY_AI = 'IDP/MY_PLAN/GENERATE_DEVELOPMENT_ACTIONS_BY_AI'
const ADD_DEVELOPMENT_ACTION = 'IPD/MY_PLAN/ADD_DEVELOPMENT_ACTION'
const REMOVE_DEVELOPMENT_ACTION = 'IPD/MY_PLAN/REMOVE_DEVELOPMENT_ACTION'
const UPDATE_DEVELOPMENT_ACTION = 'IDP/MY_PLAN/UPDATE_DEVELOPMENT_ACTION'
const SAVE_DEVELOPMENT_ACTIONS = 'IDP/MY_PLAN/SAVE_DEVELOPMENT_ACTIONS'
const FETCH_DIRECT_REPORTS = 'IDP/MY_PLAN/FETCH_DIRECT_REPORTS'
const UPDATE_DEVELOPMENT_ACTION_PROGRESS = 'IPD/MY_PLAN/UPDATE_DEVELOPMENT_ACTION_PROGRESS'
const UPDATE_USER_IDP_SKILL = 'IDP/MY_PLAN/UPDATE_USER_IDP_SKILL'
const SAVE_USER_IDP_SKILLS = 'IDP/MY_PLAN/SAVE_USER_IDP_SKILLS'
const FETCH_IDP_SKILLS = 'IDP/MY_PLAN/FETCH_IDP_SKILLS'
const FETCH_USER_IDP_COMMENTS = 'IDP/MY_PLAN/FETCH_USER_IDP_COMMENTS'
const FETCH_USER_IDP_COMMENT_BY_ID = 'IDP/MY_PLAN/FETCH_USER_IDP_COMMENT_BY_ID'
const FETCH_USER_IDP_COMMENT_BY_SKILL_ID = 'IDP/MY_PLAN/FETCH_USER_IDP_COMMENT_BY_SKILL_ID'
const ADD_USER_IDP_COMMENT = 'IDP/MY_PLAN/ADD_USER_IDP_COMMENT'
const ADD_USER_IDP_COMMENT_REPLY = 'IDP/MY_PLAN/ADD_USER_IDP_COMMENT_REPLY'
const ADD_USER_IDP_COMMENT_REPLY_BY_SKILL_ID = 'IDP/MY_PLAN/ADD_USER_IDP_COMMENT_REPLY_BY_SKILL_ID'
const MARK_COMMENT_RESOLVED = 'IDP/MY_PLAN/MARK_COMMENT_RESOLVED'
const MARK_COMMENT_UNRESOLVED = 'IDP/MY_PLAN/MARK_COMMENT_UNRESOLVED'
const SHOW_COMMENTS_FOR_SKILL_ID = 'IDP/MY_PLAN/SHOW_COMMENTS_FOR_SKILL_ID'
const FETCH_SKILL_GAPS_REPORT = 'IDP/MY_PLAN/FETCH_SKILL_GAPS_REPORT'

export const AsyncDownloadTR = t.type({
  status: t.string,
  response: t.type({
    asyncRequestUuid: t.string,
    processingStatus: t.string,
    responseType: t.string,
    responseData: t.union([
      t.string,
      t.null,
      t.type({}),
    ]),
  }),
})

interface UserIdpPlan {
  status: string | null;
  selfRatingEnabled: boolean;
  skillGapReportAvailable: boolean | null;
  userIdpSkills: Skill[];
  userIdpDevelopmentActions: DevelopmentAction[];
  directReportees: object[];
  AIGeneratedDevelopmentActions: Record<number, Pick<DevelopmentAction, 'description' | 'learningStyle'>[]>;
  skills: Skill[];
  user: object;
  unreadCommentsCount: number;
  userIdpComments: object[];
  userIdpCommentsTotalCount: number | null;
  showCommentsForSkillId: number | null;
  userIdpCommentsBySkillId: Record<string, UserIdpComment[]>;
  userIdpCommentsBySkillIdTotalCount: Record<string, number>;
  introMessage: string;
  skillGapReportData:FetchSkillGapsResponse | null
}

export interface UserIdpComment {
  id: string
  content: string
  createdAt: string
  resourceId: string
  resourceType: string
  repliesCount: number
  edited: boolean
  unreadRepliesCount: number
  parentId: number | null
  resolvedAt: string | null
  replies: UserIdpComment[]
  createdBy: {
    photo: string
    id: string
    firstName: string
    lastName: string
    email: string
  }
  resolvedBy: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
}

interface GenerateDevelopmentActionsByAIPayload {
  userIdpSkillId: number;
  generateMore: boolean;
  generatedActions: DevelopmentAction[];
  lang?: string;
}

export interface UserIdpCommentPayload {
  resourceId: string | null;
  resourceType: string | null;
  content: string;
}

export interface UserIdpCommentReplyPayload {
  content: string;
  parentId: string;
}

export interface UserIdpCommentsQuery {
  page: number;
  pageSize?: number;
  loadReplies?: boolean;
  unreadByUser?: boolean;
  q?: {
    resourceIdEq?: string;
    resourceTypeEq?: string;
    resolvedEq?: boolean;
    unreadByUser?: boolean;
    s?: string;
  }
}

type UserIdpPlanStatus = typeof USER_IDP_PLAN_STATUS[keyof typeof USER_IDP_PLAN_STATUS];

export const fetchDirectReportees = (payload: object) => ({
  type: FETCH_DIRECT_REPORTS,
  request: {
    url: '/direct_reportees',
    body: payload,
  },
})

export const fetchUserIdpDevelopmentActions = (userId: string) => ({
  type: FETCH_USER_IDP_DEVELOPMENT_ACTIONS,
  request: {
    url: `/user_idp_development_actions?user_id=${userId}`,
  },
})

export const saveUserIdpDevelopmentActions = (userId: string, data: Partial<DevelopmentAction>[]) => ({
  type: SAVE_DEVELOPMENT_ACTIONS,
  request: {
    url: `/user_idp_development_actions/save_plan?user_id=${userId}`,
    method: 'post',
    body: { user_idp_development_action: data },
  },
})

export const addDevelopmentActionInPlan = (developmentAction: Partial<DevelopmentAction>) => ({
  type: ADD_DEVELOPMENT_ACTION,
  data: developmentAction,
})


export const removeDevelopmentActionFromPlan = (developmentAction: Partial<DevelopmentAction>) => ({
  type: REMOVE_DEVELOPMENT_ACTION,
  data: developmentAction,
})

export const updateDevelopmentActionInPlan = (developmentAction: Partial<DevelopmentAction>) => ({
  type: UPDATE_DEVELOPMENT_ACTION,
  data: developmentAction,
})

export const updateDevelopmentActionProgressInPlan = (
  developmentAction: Pick<DevelopmentAction, 'id' | 'progress'>,
  userId: string,
) => ({
  type: UPDATE_DEVELOPMENT_ACTION_PROGRESS,
  request: {
    url: `/user_idp_development_actions/update_progress?user_id=${userId}`,
    camelize: false,
    method: 'put',
    body: developmentAction,
  },
})

interface UserIdpCommentsResponse {
  data: UserIdpComment[]
  meta: {
    count: number
  }
}

export const fetchUserIdpComments = (
  idpUserId: string, query: UserIdpCommentsQuery = { page: 1, pageSize: 25 },
):ApiAction<UserIdpCommentsResponse> => ({
  type: FETCH_USER_IDP_COMMENTS,
  request: {
    url: `/user_idp_plans/${idpUserId}/comments`,
    body: query,
    method: 'get',
  },
})

export const fetchUserIdpCommentById = (
  idpUserId: string, commentId: string,
):ApiAction<UserIdpComment> => ({
  type: FETCH_USER_IDP_COMMENT_BY_ID,
  request: {
    url: `/user_idp_plans/${idpUserId}/comments/${commentId}`,
    method: 'get',
  },
})

export const fetchUserIdpCommentBySkillId = (
  idpUserId: string, skillId: string, query: UserIdpCommentsQuery = { page: 1, pageSize: 25 },
):ApiAction<UserIdpCommentsResponse> => ({
  type: FETCH_USER_IDP_COMMENT_BY_SKILL_ID,
  request: {
    url: `/user_idp_plans/${idpUserId}/comments`,
    body: {
      q: {
        ...query.q,
        resourceIdEq: skillId,
        resourceTypeEq: 'UserIdpSkill',
      },
      page: query.page,
      pageSize: query.pageSize,
      loadReplies: true,
    },
    method: 'get',
  },
  skillId,
})

export const addUserIdpComment = (idpUserId: string, payload: UserIdpCommentPayload) => ({
  type: ADD_USER_IDP_COMMENT,
  request: {
    url: `/user_idp_plans/${idpUserId}/comments`,
    method: 'post',
    body: payload,
  },
})

export const addUserIdpCommentReply = (idpUserId: string, payload: UserIdpCommentReplyPayload) => ({
  type: ADD_USER_IDP_COMMENT_REPLY,
  request: {
    url: `/user_idp_plans/${idpUserId}/comments`,
    method: 'post',
    body: payload,
  },
})

export const addUserIdpCommentReplyBySkillId = (
  idpUserId: string,
  skillId: string,
  payload: UserIdpCommentReplyPayload,
) => ({
  type: ADD_USER_IDP_COMMENT_REPLY_BY_SKILL_ID,
  request: {
    url: `/user_idp_plans/${idpUserId}/comments`,
    method: 'post',
    body: payload,
  },
  skillId,
})

export const markCommentResolved = (idpUserId: string, commentId: string) => ({
  type: MARK_COMMENT_RESOLVED,
  request: {
    url: `/user_idp_plans/${idpUserId}/comments/${commentId}/resolve`,
    method: 'patch',
  },
})

export const markCommentUnresolved = (idpUserId: string, commentId: string) => ({
  type: MARK_COMMENT_UNRESOLVED,
  request: {
    url: `/user_idp_plans/${idpUserId}/comments/${commentId}/unresolve?loadReplies=true`,
    method: 'patch',
  },
})

export const showCommentsForSkillId = (skillId: string | null) => ({
  type: SHOW_COMMENTS_FOR_SKILL_ID,
  skillId,
})

// TODO: Remove if not being used
export const fetchUserIdpSkills = (userId: string) => ({
  type: FETCH_USER_IDP_SKILLS,
  request: {
    url: `/user_idp_development_actions/user_idp_skills?user_id=${userId}`,
  },
})

export const fetchAvailableDevelopmentActions = (userId: string, userIdpSkillId: number) => ({
  type: FETCH_AVAILABLE_DEVELOPMENT_ACTIONS,
  request: {
    url: '/user_idp_development_actions/available_development_actions',
    body: {
      userId,
      userIdpSkillId,
    },
  },
})

export const fetchUserIdpPlan = (userId: string):ApiAction<{data:UserIdpPlan}> => ({
  type: FETCH_USER_IDP_PLAN,
  request: {
    url: `/user_idp_plans/${userId}`,
  },
})

export const updateUserIdpPlan = (userId: string, status: UserIdpPlanStatus) => ({
  type: UPDATE_USER_IDP_PLAN,
  request: {
    url: `/user_idp_plans/${userId}`,
    method: 'put',
    body: { status },
  },
})

export const generateDevelopmentActionsByAI = (payload: GenerateDevelopmentActionsByAIPayload) => ({
  type: GENERATE_DEVELOPMENT_ACTIONS_BY_AI,
  request: {
    url: '/user_idp_development_actions/generate_by_ai',
    method: 'post',
    body: payload,
  },
})

export const saveUserIdpSkills = (skills, skillType: string | null = null, userId: string | null = null) => ({
  type: SAVE_USER_IDP_SKILLS,
  request: {
    url: '/user_idp_skills/save_skills',
    method: 'post',
    body: { skills, skillType, userId },
  },
})

export const updateUserIdpSkill = (
  userIdpSkillId: number,
  payload: { initialRating: number },
  userId: number | null = null,
) => ({
  type: UPDATE_USER_IDP_SKILL,
  request: {
    url: `/user_idp_skills/${userIdpSkillId}`,
    method: 'put',
    body: { ...payload, userId },
  },
})

export const fetchIdpSkills = (filters: object | null = null):ApiAction<Skill[]> => ({
  type: FETCH_IDP_SKILLS,
  request: {
    url: '/skills',
    body: { filters },
  },
})


export const fetchSkillGaps = (userId: string, params = {}):ApiAction<FetchSkillGapsResponse> => ({
  type: FETCH_SKILL_GAPS_REPORT,
  request: {
    method: 'get',
    body: params,
    url: `/skill_gap_reports/${userId}`,
    camelize: false,
  },
})

export const HANDLERS = {
  [FETCH_USER_IDP_PLAN]: (state, action) => {
    const userIdpPlan = action.response.data
    const userIdpDevelopmentActions = _.keyBy(userIdpPlan.userIdpDevelopmentActions, 'id')
    const userIdpSkills = _.keyBy(userIdpPlan.userIdpSkills, 'id')

    return {
      ...state,
      userIdpDevelopmentActions,
      userIdpSkills,
      status: userIdpPlan.status,
      skillGapReportAvailable: userIdpPlan.skillGapReportAvailable,
      selfRatingEnabled: userIdpPlan.selfRatingEnabled,
      user: userIdpPlan.user,
      introMessage: userIdpPlan.instructions.content,
      unreadCommentsCount: userIdpPlan.unreadCommentsCount,
      userIdpComments: [],
      userIdpCommentsTotalCount: null,
      userIdpCommentsBySkillId: {},
      userIdpCommentsBySkillIdTotalCount: {},
      showCommentsForSkillId: null,
    }
  },
  [FETCH_DIRECT_REPORTS]: (state, action) => ({
    ...state,
    directReportees: action.response.data,
    directReporteesTotalCount: action.response.meta.count,
  }),
  [FETCH_USER_IDP_DEVELOPMENT_ACTIONS]: (state, action) => ({
    ...state,
    userIdpDevelopmentActions: _.keyBy(action.response.data, 'id'),
  }),
  [FETCH_USER_IDP_SKILLS]: (state, action) => ({
    ...state,
    userIdpSkills: _.keyBy(action.response.data, 'id'),
  }),
  [FETCH_AVAILABLE_DEVELOPMENT_ACTIONS]: (state, action) => ({
    ...state,
    availableDevelopmentActions: _.keyBy(action.response.data, 'id'),
  }),
  [GENERATE_DEVELOPMENT_ACTIONS_BY_AI]: (state, action) => {
    const generatedDevelopmentActions = _.groupBy(action.response.data, 'skillId')

    return {
      ...state,
      AIGeneratedDevelopmentActions: { ...state.AIGeneratedDevelopmentActions, ...generatedDevelopmentActions },
    }
  },
  [UPDATE_DEVELOPMENT_ACTION]: (state, action) => {
    const newDevelopmentAction = action.data
    return {
      ...state,
      userIdpDevelopmentActions: {
        ...state.userIdpDevelopmentActions,
        [newDevelopmentAction.id]: {
          ...state.userIdpDevelopmentActions[newDevelopmentAction.id],
          ...newDevelopmentAction,
        },
      },
    }
  },
  [UPDATE_DEVELOPMENT_ACTION_PROGRESS]: (state, action) => {
    const newDevelopmentAction = action.response
    return {
      ...state,
      userIdpDevelopmentActions: {
        ...state.userIdpDevelopmentActions,
        [newDevelopmentAction.id]: {
          ...state.userIdpDevelopmentActions[newDevelopmentAction.id],
          ...newDevelopmentAction,
        },
      },
    }
  },

  [ADD_DEVELOPMENT_ACTION]: (state, action) => {
    const developmentActions:Partial<DevelopmentAction>[] = action.data

    return {
      ...state,
      userIdpDevelopmentActions: {
        ...state.userIdpDevelopmentActions,
        ...developmentActions,
      },
    }
  },
  [REMOVE_DEVELOPMENT_ACTION]: (state, action) => {
    const developmentAction = action.data
    const userIdpDevelopmentActions = { ...state.userIdpDevelopmentActions }

    delete userIdpDevelopmentActions[developmentAction.id]

    return {
      ...state,
      userIdpDevelopmentActions,
    }
  },
  [UPDATE_USER_IDP_PLAN]: (state, action) => ({
    ...state,
    status: action.response.status,
  }),
  [SAVE_USER_IDP_SKILLS]: (state, action) => {
    const { skillType: requestedSkillType, data: skills } = action.response

    const { userIdpDevelopmentActions, userIdpSkills } = state

    // userIdpSkills which are not part of the requested category, they should be kept as is
    // only when requestedSkillType is null, all userIdpSkills should be kept as is
    const userIdpSkillsUnmodified = _.pickBy(userIdpSkills,
      ({ skillType }) => !requestedSkillType || skillType !== requestedSkillType)

    const updatedUserIdpSkills = _.keyBy(skills, 'id')

    // keep only those userIdpDevelopmentActions which are part of the updated userIdpSkills list
    const updatedUserIdpDevelopmentActions = _.pickBy(userIdpDevelopmentActions,
      ({ userIdpSkillId }) => userIdpSkillsUnmodified[userIdpSkillId] || updatedUserIdpSkills[userIdpSkillId])

    const newUserIdpSkillsList = !requestedSkillType
      ? updatedUserIdpSkills : { ...userIdpSkillsUnmodified, ...updatedUserIdpSkills }

    return {
      ...state,
      userIdpSkills: newUserIdpSkillsList,
      userIdpDevelopmentActions: updatedUserIdpDevelopmentActions,
    }
  },
  [UPDATE_USER_IDP_SKILL]: (state, action) => {
    const { userIdpSkills } = state
    const updatedUserIdpSkill = action.response
    userIdpSkills[updatedUserIdpSkill.id] = updatedUserIdpSkill

    return {
      ...state,
      userIdpSkills,
    }
  },
  [FETCH_USER_IDP_COMMENTS]: (state, action) => {
    const { data: comments, meta } = action.response
    const { resourceId, resourceType } = getRequestQuery(action)

    const newState = {
      ...state,
      userIdpComments: comments,
      userIdpCommentsTotalCount: meta.count,
    }

    if (resourceId && resourceType) {
      newState.userIdpSkills = updateUserIdpSkillComments(
        state,
        resourceId,
        () => comments,
      )
    }

    return newState
  },
  [FETCH_USER_IDP_COMMENT_BY_SKILL_ID]: (state, action) => {
    const { skillId } = action.requestAction

    const { data: comments, meta } = action.response

    const newState = {
      ...state,
      userIdpCommentsBySkillId: {
        ...state.userIdpCommentsBySkillId,
        [skillId]: comments,
      },
      userIdpCommentsBySkillIdTotalCount: {
        ...state.userIdpCommentsBySkillIdTotalCount,
        [skillId]: meta.count,
      },
    }
    return newState
  },
  [ADD_USER_IDP_COMMENT]: (state, action) => {
    const newComment = action.response.data
    const { resourceId, resourceType } = newComment

    const newState = {
      ...state,
      userIdpComments: [newComment, ...(state.userIdpComments || [])],
    }

    if (resourceId && resourceType) {
      newState.userIdpSkills = updateUserIdpSkillComments(
        state,
        resourceId,
        existingComments => [newComment, ...existingComments],
      )
      newState.userIdpCommentsBySkillId = {
        ...state.userIdpCommentsBySkillId,
        [resourceId]: [newComment, ...(state.userIdpCommentsBySkillId[resourceId] || [])],
      }
      newState.userIdpCommentsBySkillIdTotalCount = {
        ...state.userIdpCommentsBySkillIdTotalCount,
        [resourceId]: state.userIdpCommentsBySkillIdTotalCount[resourceId] + 1,
      }
    }

    return newState
  },
  [ADD_USER_IDP_COMMENT_REPLY_BY_SKILL_ID]: (state, action) => {
    const newReply = action.response.data
    const { skillId } = action.requestAction
    let replies: UserIdpComment[] = []

    // Check if the skill comments exist before trying to map
    if (!state.userIdpCommentsBySkillId?.[skillId]) {
      return state
    }

    const newComments = [...(state.userIdpCommentsBySkillId[skillId].map((c: UserIdpComment) => {
      if (c.id === newReply.parentId) {
        replies = [...(c.replies || []), newReply]
        return {
          ...c,
          repliesCount: c.repliesCount + 1,
          replies,
        }
      }
      return c
    }))]

    const newState = {
      ...state,
      userIdpCommentsBySkillId: {
        ...state.userIdpCommentsBySkillId,
        [skillId]: newComments,
      },
      userIdpComments: [...state.userIdpComments.map(c => (c.id === newReply.parentId ? {
        ...c,
        replies,
      } : c))],
    }
    return newState
  },
  [ADD_USER_IDP_COMMENT_REPLY]: (state, action) => {
    const newReply = action.response.data
    const { parentId } = newReply
    return {
      ...state,
      userIdpComments: [...state.userIdpComments.map(c => (c.id === parentId ? {
        ...c,
        repliesCount: c.repliesCount + 1,
        replies: [...(c.replies || []), newReply],
      } : c))],
    }
  },
  [MARK_COMMENT_RESOLVED]: (state, action) => {
    const comment = action.response.data
    const newState = {
      ...state,
      userIdpComments: state.userIdpComments.map(c => (c.id === comment.id ? { ...comment, replies: c.replies } : c)),
    }

    if (comment.resourceId && state.userIdpCommentsBySkillId[comment.resourceId]) {
      newState.userIdpCommentsBySkillId = {
        ...state.userIdpCommentsBySkillId,
        [comment.resourceId]: state.userIdpCommentsBySkillId[comment.resourceId].map(c => (c.id === comment.id
          ? { ...comment, replies: c.replies }
          : c)),
      }
    }

    return newState
  },
  [MARK_COMMENT_UNRESOLVED]: (state, action) => {
    const comment = action.response.data
    const newState = {
      ...state,
      userIdpComments: state.userIdpComments.map(c => (c.id === comment.id ? { ...comment, replies: c.replies } : c)),
    }

    if (comment.resourceId && state.userIdpCommentsBySkillId[comment.resourceId]) {
      newState.userIdpCommentsBySkillId = {
        ...state.userIdpCommentsBySkillId,
        [comment.resourceId]: state.userIdpCommentsBySkillId[comment.resourceId].map(c => (c.id === comment.id
          ? { ...comment, replies: c.replies }
          : c)),
      }
    }

    return newState
  },
  [FETCH_USER_IDP_COMMENT_BY_ID]: (state, action) => {
    const comment = action.response.data
    return {
      ...state,
      userIdpComments: [...state.userIdpComments.map(c => (c.id === comment.id ? comment : c))],
    }
  },
  [SHOW_COMMENTS_FOR_SKILL_ID]: (state, action) => {
    const { skillId } = action
    return {
      ...state,
      showCommentsForSkillId: skillId?.toString(),
    }
  },

  [FETCH_SKILL_GAPS_REPORT]: (state, action) => ({
    ...state,
    skillGapReportData: action.response,
  }),
}

export const defaultState: UserIdpPlan = {
  directReportees: [],
  AIGeneratedDevelopmentActions: {},
  status: null,
  selfRatingEnabled: false,
  skillGapReportAvailable: null,
  userIdpDevelopmentActions: [],
  userIdpSkills: [],
  skills: [],
  user: {},
  unreadCommentsCount: 0,
  userIdpComments: [],
  introMessage: '',
  userIdpCommentsTotalCount: null,
  showCommentsForSkillId: null,
  userIdpCommentsBySkillId: {},
  userIdpCommentsBySkillIdTotalCount: {},
  skillGapReportData: null,
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
