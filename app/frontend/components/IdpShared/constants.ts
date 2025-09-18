import { BehavioralSkillIcon, TechnicalSkillIcon, OtherSkillIcon } from '~/glint/icons'

export const USER_IDP_SKILL = {
  behavioral: {
    Icon: BehavioralSkillIcon,
  },
  technical: {
    Icon: TechnicalSkillIcon,
  },
  other: {
    Icon: OtherSkillIcon,
  },
}

export const USER_IDP_PLAN_STATUS = {
  NOT_STARTED: 'not_started',
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  AI_ASSISTED_IDP_IN_PROGRESS: 'ai_assisted_idp_in_progress',
}

export const STATUS_COLORS = {
  pending_approval: 'orange',
  approved: 'green',
  rejected: 'red',
  in_progress: 'blue',
  completed: 'purple',
}
