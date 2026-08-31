import _ from 'lodash'
import { CampaignScores, type Error } from '~/modules/admin/modules/campaigns/core/combinedScoring'

export enum StackRank {
  UNRANKED = '-',
}

export type DataType = {
  id: string;
  email: string;
  active: string;
  campaignScoresFinalized: boolean | null;
  campaignScoresFinalizedDate: string | null;
  campaignScoresCalculatedDate: string | null;
  errors: Error[] | null;
  stackRank: number | StackRank ;
  [key: string]: string | number | boolean | null | Error[] | {[key: string]: boolean};
}

export const processData = (
  CampaignFactorValuesData: CampaignScores[],
): DataType[] => _.map(CampaignFactorValuesData, (valueData) => {
  const userId = valueData?.user.id
  const factorScores = _.chain(valueData.campaignFactorValues)
    .keyBy('campaignFactorId')
    .mapValues(score => `${score.value ?? '-'}${score.label ? ` (${score.label})` : ''}`)
    .value()

  return {
    key: userId,
    id: userId,
    active: valueData?.active ? 'Yes' : 'No',
    email: valueData?.user.email,
    campaignScoresFinalizedDate: valueData?.campaignScoresFinalizedDate,
    campaignScoresCalculatedDate: valueData?.campaignScoresCalculatedDate,
    campaignScoresFinalized: valueData?.campaignScoresFinalized,
    stackRank: valueData?.stackRank || StackRank.UNRANKED,
    errors: valueData?.campaignScoresErrors,
    ...factorScores,
  }
})
