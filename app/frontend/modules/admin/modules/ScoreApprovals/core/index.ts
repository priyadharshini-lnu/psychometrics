import * as t from 'io-ts'

export const TaskTR = t.type({
  id: t.string,
  approvalStatus: t.string,
  projectId: t.number,
  clientId: t.number,
  campaignId: t.number,
  approvalStatusUpdatedAt: t.union([t.string, t.null]),
  allowBulkApprove: t.boolean,
  allowBulkApproveScores: t.boolean,
  campaign: t.type({
    id: t.string,
  }),
  subject: t.type({
    id: t.string,
  }),
  assessment: t.type({
    id: t.string,
  }),
  scoreAssessedBy: t.union([t.type({
    id: t.string,
  }), t.undefined]),
  scoreApprovedBy: t.union([t.type({
    id: t.string,
  }), t.undefined]),
})

export const IndicatorTR = t.type({
  id: t.string,
  questionId: t.string,
  text: t.string,
  type: t.string,
  status: t.string,
  parentFactorId: t.number,
})

export const CompetencyTR = t.type({
  id: t.string,
  questionId: t.string,
  text: t.string,
  type: t.string,
  status: t.string,
})

export const ScoreApprovalTR = t.type({
  id: t.string,
  approvalStatus: t.string,
  projectId: t.number,
  clientId: t.number,
  campaignId: t.number,
  status: t.string,
  allowBulkApproveScores: t.boolean,
  reviewAs: t.string,
  questions: t.array(t.type({
    id: t.string,
    text: t.string,
    type: t.string,
  })),
  indicators: t.record(t.string, t.array(IndicatorTR)),
  results: t.record(t.string, t.union([t.string, t.number, t.boolean])),
  competencies: t.array(CompetencyTR),
  mediaResponses: t.record(t.string, t.union([t.string, t.number, t.boolean])),
})


export const TasksTR = t.array(TaskTR)

export const CampaignTR = t.type({
  id: t.string,
  name: t.string,
})

export const AssessmentTR = t.type({
  id: t.string,
  name: t.string,
})

export const UserTR = t.type({
  id: t.string,
  name: t.string,
  email: t.string,
})


export type Campaign = t.TypeOf<typeof CampaignTR>
export type Assessment = t.TypeOf<typeof AssessmentTR>
export type User = t.TypeOf<typeof UserTR>
export type Task = t.TypeOf<typeof TaskTR>
export type ScoreApproval = t.TypeOf<typeof ScoreApprovalTR>
export type Indicator = t.TypeOf<typeof IndicatorTR>
export type Competency = t.TypeOf<typeof CompetencyTR>


export const Schema = {
  type: 'ai_score_approvals',
  relationships: {
    subject: {
      type: 'users',
    },
    assessor: {
      type: 'users',
    },
    approver: {
      type: 'users',
    },
    assessment: {
      type: 'assessments',
    },
    campaign: {
      type: 'campaigns',
    },
    project: {
      type: 'projects',
    },
    client: {
      type: 'clients',
    },
    score_assessed_by: {
      type: 'users',
    },
    score_approved_by: {
      type: 'users',
    },
  },
}
