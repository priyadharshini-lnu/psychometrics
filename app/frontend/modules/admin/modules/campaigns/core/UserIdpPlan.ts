import * as t from 'io-ts'

const DevelopmentActionsTR = t.type({
  id: t.string,
  userIdpPlanId: t.number,
  userIdpSkillId: t.number,
  developmentActionId: t.union([t.number, t.null]),
  developmentActionType: t.union([t.number, t.string]),
  customAction: t.string,
  customActionLearningStyle: t.string,
  name: t.string,
  description: t.string,
  courseUrl: t.string,
  courseStartDate: t.string,
  courseEndDate: t.string,
  userIdpDevelopmentActionId: t.number,
  learningStyle: t.union([
    t.literal('on_the_job'),
    t.literal('learning_from_others'),
    t.literal('structured_learning'),
  ]),
  image: t.string,
  progress: t.number,
  startDateTime: t.string,
  endDateTime: t.string,
  userIdpSkill: t.type({
    id: t.string,
    skillId: t.number,
    userIdpPlanId: t.number,
  }),
})


const SkillsTR = t.type({
  id: t.string,
  name: t.string,
  description: t.string,
  skillType: t.string,
  tagList: t.array(t.string),
  global: t.boolean,
  defaultLanguage: t.string,
  developmentActions: t.array(DevelopmentActionsTR),
  skillId: t.string,
})

export const UserIdpPlanTR = t.type({
  id: t.string,
  userId: t.union([t.number, t.string]),
  idpTemplateId: t.union([t.number, t.string]),
  campaignId: t.union([t.number, t.string]),
  active: t.boolean,
  creatorId: t.union([t.number, t.string]),
  status: t.string,
  skillGapReportId: t.number,
  skillGapReportAvailable: t.boolean,
  skills: t.array(SkillsTR),
  userIdpDevelopmentActions: t.array(DevelopmentActionsTR),
  userIdpSkills: t.array(SkillsTR),
  instructions: t.type({
    content: t.string,
  }),
})


export const UserActiveIdpTemplateTR = t.type({
  id: t.string,
  userId: t.union([t.number, t.string]),
  idpTemplateId: t.union([t.number, t.string]),
  campaignId: t.union([t.number, t.string]),
  active: t.boolean,
  creatorId: t.union([t.number, t.string]),
  status: t.string,
  skillGapReportId: t.number,
  skillGapReportAvailable: t.boolean,
})

const IDPUserTR = t.type({
  id: t.string,
  photoUrl: t.string,
  fullName: t.string,
  email: t.string,
})

export type IdpSkills = t.TypeOf<typeof SkillsTR>
export type UserIdpSkills = t.TypeOf<typeof SkillsTR>
export type UserIdpPlan = t.TypeOf<typeof UserIdpPlanTR>
export type UserIdpDevelopmentActions = t.TypeOf<typeof DevelopmentActionsTR>
export type IdpUser = t.TypeOf<typeof IDPUserTR>
export type UserActiveIdpTemplate = t.TypeOf<typeof UserActiveIdpTemplateTR>


export const Schema = {
  type: 'user_idp_plans',
  relationships: {
    skills: {
      type: 'skills',
    },
    user_idp_development_actions: {
      type: 'user_idp_development_actions',
    },
  },
}


const DefaultLanguageTR = t.type({
  code: t.string,
  direction: t.string,
  name: t.string,
})

const SkillGapTR = t.type({
  id: t.number,
  campaign_id: t.number,
  is_self: t.boolean,
  pdf: t.type({
    url: t.string,
  }),
  report: t.type({
    default_language: DefaultLanguageTR,
    available_languages: t.array(DefaultLanguageTR),
    locales: t.type({}),
  }),
  report_data: t.array(t.type({})),
  report_url: t.string,
  results: t.type({}),
  status: t.string,
  user: t.type({
    datasheet: t.any,
    email: t.string,
    first_name: t.string,
    id: t.number,
    last_name: t.string,
    photo: t.union([t.string, t.null]),
  }),
})

export type FetchSkillGapsResponse = t.TypeOf<typeof SkillGapTR>
