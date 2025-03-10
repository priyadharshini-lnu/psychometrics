import { Skill, DevelopmentAction } from 'components/IdpShared/DevelopmentActions'
import _ from 'lodash'
import { USER_IDP_PLAN_STATUS } from '~/modules/endUser/modules/campaigns/routes/idp/constants'

const FETCH_USER_IDP_PLAN = 'IDP/MY_PLAN/FETCH_USER_IDP_PLAN'
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
const ADD_USER_IDP_SKILLS = 'IDP/MY_PLAN/ADD_USER_IDP_SKILLS'
const FETCH_IDP_SKILLS = 'IDP/MY_PLAN/FETCH_IDP_SKILLS'

interface UserIdpPlan {
  status: string | null;
  selfRatingEnabled: boolean;
  userIdpSkills: Skill[];
  userIdpDevelopmentActions: DevelopmentAction[];
  directReports: object[];
  AIGeneratedDevelopmentActions: Record<number, Pick<DevelopmentAction, 'description' | 'learningStyle'>[]>;
  skills: Skill[]
}

interface GenerateDevelopmentActionsByAIPayload {
  userIdpSkillId: number;
  generateMore: boolean;
  generatedActions: DevelopmentAction[];
  lang?: string;
}

type UserIdpPlanStatus = typeof USER_IDP_PLAN_STATUS[keyof typeof USER_IDP_PLAN_STATUS];

export const fetchDirectReports = () => ({
  type: FETCH_DIRECT_REPORTS,
  request: {
    url: '/direct_reports',
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
) => ({
  type: UPDATE_DEVELOPMENT_ACTION_PROGRESS,
  request: {
    url: '/user_idp_development_actions/update_progress',
    camelize: false,
    method: 'put',
    body: developmentAction,
  },
})

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

export const fetchUserIdpPlan = (userId: string) => ({
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

export const addUserIdpSkills = skills => ({
  type: ADD_USER_IDP_SKILLS,
  request: {
    url: '/user_idp_skills',
    method: 'post',
    body: { skills },
  },
})

export const updateUserIdpSkill = (userIdpSkillId: number, payload: { initialRating: number }) => ({
  type: UPDATE_USER_IDP_SKILL,
  request: {
    url: `/user_idp_skills/${userIdpSkillId}`,
    method: 'put',
    body: { ...payload },
  },
})

export const fetchIdpSkills = (filters: object | null = null) => ({
  type: FETCH_IDP_SKILLS,
  request: {
    url: '/skills',
    body: { filters },
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
      selfRatingEnabled: userIdpPlan.selfRatingEnabled,
    }
  },
  [FETCH_DIRECT_REPORTS]: (state, action) => ({
    ...state,
    directReports: action.response.data,
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
    const developmentAction = action.data
    return {
      ...state,
      userIdpDevelopmentActions: {
        ...state.userIdpDevelopmentActions,
        [developmentAction.id]: developmentAction,
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
  [ADD_USER_IDP_SKILLS]: (state, action) => {
    const addedUserIdpSkills = _.keyBy(action.response.data, 'id')

    return {
      ...state,
      userIdpSkills: { ...state.userIdpSkills, ...addedUserIdpSkills },
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
}

export const defaultState: UserIdpPlan = {
  directReports: [],
  AIGeneratedDevelopmentActions: {},
  status: null,
  selfRatingEnabled: false,
  userIdpDevelopmentActions: [],
  userIdpSkills: [],
  skills: [],
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
