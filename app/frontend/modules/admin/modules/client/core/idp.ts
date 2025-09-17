import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

const SkillTR = t.type({
  id: t.string,
  name: t.union([t.string, t.null, t.undefined]),
  skillType: t.union([t.string, t.null, t.undefined]),
  projectId: t.union([t.string, t.null, t.undefined]),
})

export const ReportTR = t.type({
  id: t.string,
  name: t.string,
})

export const AssistantTR = t.type({
  id: t.string,
  name: t.string,
})

export const OneClickAIAssistantTR = t.type({
  id: t.string,
})

export const DocumentAnalysisAiAssistantTR = t.type({
  id: t.string,
})

export type IdpAssistant = t.TypeOf<typeof AssistantTR>

export const ReflectionQuestionTR = t.type({
  id: t.string,
  question: t.union([t.string, t.null]),
  mandatory: t.boolean,
  minWords: t.union([t.number, t.null]),
  maxWords: t.union([t.number, t.null]),
})

export const InterviewQuestionTR = t.type({
  id: t.string,
  question: t.union([t.string, t.null]),
  mandatory: t.boolean,
  timeLimit: t.union([t.number, t.null]),
  questionType: t.union([t.string, t.null]),
})

export const IdpListItemTR = t.type({
  id: t.string,
  name: t.string,
  description: t.string,
  status: t.string,
  allowEdit: t.boolean,
  report: t.union([
    ReportTR,
    t.undefined,
  ]),
})

export const IdpTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    description: t.string,
    selfRatingEnabled: t.union([t.boolean, t.undefined]),
    behaviouralGlobalTags: t.union([t.array(t.string), t.undefined]),
    behaviouralClientTags: t.union([t.array(t.string), t.undefined]),
    technicalGlobalTags: t.union([t.array(t.string), t.undefined]),
    technicalClientTags: t.union([t.array(t.string), t.undefined]),
    behavioralGlobalSkillSettings: t.union([t.string, t.null]),
    behavioralClientSkillSettings: t.union([t.string, t.null]),
    technicalGlobalSkillSettings: t.union([t.string, t.null]),
    technicalClientSkillSettings: t.union([t.string, t.null]),
    titleText: t.union([t.string, t.null]),
    subtitleText: t.union([t.string, t.null]),
    fields: t.array(t.string),
    background: t.union([t.string, t.null]),
    clientLogo: t.union([t.string, t.null]),
    logoType: t.string,
    showReflections: t.boolean,
    instructions: t.type({
      content: t.string,
    }),
    availableLocales: t.array(t.string),
    reflectionQuestions: t.array(ReflectionQuestionTR),
    interviewQuestions: t.array(InterviewQuestionTR),
    translations: t.record(t.string, t.partial({
      titleText: t.union([t.string, t.null]),
      subtitleText: t.union([t.string, t.null]),
    })),
    status: t.string,
    allowEdit: t.boolean,
    aiEnabled: t.boolean,
    aiAssistedIdpEnabled: t.boolean,
    oneClickIdpEnabled: t.boolean,
    skillSourcePreference: t.string,
    oneClickAiAssistantId: t.union([OneClickAIAssistantTR, t.undefined]),
    documentAnalysisAiAssistantId: t.union([DocumentAnalysisAiAssistantTR, t.undefined]),
    skills: t.union([
      t.array(SkillTR),
      t.undefined]),
    report: t.union([
      ReportTR,
      t.undefined]),
    oneClickAiAssistant: t.union([
      AssistantTR,
      t.undefined,
    ]),
    documentAnalysisAiAssistant: t.union([
      AssistantTR,
      t.undefined,
    ]),
  })])

export const IntroMessageTR = t.type({
  instructions: t.union([t.type({}), t.type({
    content: t.string,
  })]),
})

export type IdpTemplateReflectionQuestion = t.TypeOf<typeof ReflectionQuestionTR>
export type IdpTemplateInterviewQuestion = t.TypeOf<typeof InterviewQuestionTR>
export type Idp = t.TypeOf<typeof IdpTR>
export type Skill = t.TypeOf<typeof SkillTR>
export type Report = t.TypeOf<typeof ReportTR>

export const Schema = {
  type: 'idp_templates',
  relationships: {
    skills: {
      type: 'skills',
    },
    project: {
      type: 'clients',
    },
    report: {
      type: 'reports',
    },
    one_click_ai_assistant: {
      type: 'assistants',
    },
    document_analysis_ai_assistant: {
      type: 'assistants',
    },
  },
}
