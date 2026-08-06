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
    name: t.string,
  }),
  project: t.type({
    id: t.string,
    name: t.string,
  }),
  client: t.type({
    id: t.string,
    name: t.string,
  }),
  subject: t.type({
    id: t.string,
    name: t.string,
  }),
  assessment: t.type({
    id: t.string,
    name: t.string,
  }),
  scoreAssessedBy: t.union([t.type({
    id: t.string,
    name: t.string,
  }), t.undefined]),
  scoreApprovedBy: t.union([t.type({
    id: t.string,
    name: t.string,
  }), t.undefined]),
})

export const IndicatorTR = t.type({
  id: t.string,
  questionId: t.string,
  text: t.string,
  type: t.string,
  status: t.string,
  parentFactorId: t.number,
  scoringType: t.string,
})

export const CompetencyTR = t.type({
  id: t.string,
  questionId: t.string,
  text: t.string,
  type: t.string,
  status: t.string,
  scoringType: t.string,
})

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

export const ScoreApprovalTR = t.type({
  id: t.string,
  approvalStatus: t.string,
  projectId: t.number,
  clientId: t.number,
  campaignId: t.number,
  status: t.string,
  allowBulkApproveScores: t.boolean,
  reviewAs: t.string,
  allowApprove: t.string,
  resultStale: t.boolean,
  allowReset: t.boolean,
  questions: t.array(t.type({
    id: t.string,
    text: t.string,
    type: t.string,
  })),
  indicators: t.record(t.string, t.array(IndicatorTR)),
  results: t.record(t.string, t.union([t.string, t.number, t.boolean])),
  competencies: t.array(CompetencyTR),
  mediaResponses: t.record(t.string, t.union([t.string, t.number, t.boolean])),
  campaignName: t.string,
  projectName: t.string,
  clientName: t.string,
  subjectName: t.string,
  subjectEmail: t.string,
  assessmentName: t.string,
  assessedBy: t.union([t.string, t.undefined]),
  approvedBy: t.union([t.string, t.undefined]),
  highlightAnchors: t.union([t.record(t.string, t.array(t.type({
    segmentIndex: t.number,
    startChar: t.number,
    endChar: t.number,
    sentiment: t.keyof({
      positive: null, negative: null, mixed: null, neutral: null,
    }),
  }))), t.undefined]),
})


export const TasksTR = t.array(TaskTR)

export type Campaign = t.TypeOf<typeof CampaignTR>
export type Assessment = t.TypeOf<typeof AssessmentTR>
export type User = t.TypeOf<typeof UserTR>
export type Task = t.TypeOf<typeof TaskTR>
export type ScoreApproval = t.TypeOf<typeof ScoreApprovalTR>
export type Indicator = t.TypeOf<typeof IndicatorTR>
export type Competency = t.TypeOf<typeof CompetencyTR>

export interface Citation {
  text: string
  sentiment: 'positive' | 'negative' | 'neutral'
  startTime: number | null
  endTime: number | null
}

export interface TranscriptionSegment {
  startTime: number
  endTime: number
  text: string
}

export interface HighlightAnchor {
  segmentIndex: number
  startChar: number
  endChar: number
  sentiment: 'positive' | 'negative' | 'mixed' | 'neutral'
}


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
