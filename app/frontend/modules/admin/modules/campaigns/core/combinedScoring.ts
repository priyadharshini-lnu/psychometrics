import * as t from 'io-ts'

export enum CampaignFactorOutputType { 'numeric' = 'numeric', 'string' = 'string' }

export const CampaignFactorValueTR = t.type({
  id: t.string,
  campaignFactorId: t.number,
  numericValue: t.union([t.number, t.null]),
  stringValue: t.union([t.string, t.null]),
})

export const FactorTR = t.type({
  id: t.string,
  factorId: t.string,
  name: t.string,
})

export const ScoreTR = t.type({
  id: t.string,
  evaluator: t.type({
    id: t.string,
    firstName: t.string,
    lastName: t.string,
    email: t.string,
  }),
  assessment: t.type({
    id: t.string,
    name: t.string,
  }),
  scores: t.record(t.string, t.union([t.number, t.null])),
})

const ErrorTR = t.type({
  factorId: t.string,
  message: t.string,
})

export type Error = t.TypeOf<typeof ErrorTR>

export const CampaignScoresTR = t.type({
  id: t.string,
  user: t.type({
    id: t.string,
    firstName: t.string,
    lastName: t.string,
    email: t.string,
  }),
  campaignScoresFinalized: t.union([t.boolean, t.null]),
  campaignScoresFinalizedDate: t.union([t.string, t.null]),
  campaignScoresCalculatedDate: t.union([t.string, t.null]),
  campaignScoresErrors: t.union([t.array(ErrorTR), t.null]),
  campaignFactorValues: t.array(t.type({
    id: t.string,
    campaignFactorId: t.number,
    numericValue: t.union([t.number, t.null]),
    stringValue: t.union([t.string, t.null]),
  })),
})

export type Weightage = {
  id: string;
  weight: number;
  assessment: { id: string; type: string };
  factor: { id: string; type: string };
}

// Export the types
export type Factor = t.TypeOf<typeof FactorTR>;
export type Score = t.TypeOf<typeof ScoreTR>;
export type CampaignFactorValue = t.TypeOf<typeof CampaignFactorValueTR>;
export type CampaignScores = t.TypeOf<typeof CampaignScoresTR>
