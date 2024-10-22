import _ from 'lodash'
import { FC } from 'react'
import { CampaignFactorModel } from 'modules/survey/interfaces/questions/CampaignFactorFeedback'
import { CampaignFactor } from '~/components/CampaignFactorsForm'

type Props = {
  isReal: boolean,
  result: CampaignFactorModel[] | null,
  model: {
    props: {
      answerIndex: number,
      answerIndexCode: string,
      campaignFactorResultType: string,
    },
    campaignFactorsList: CampaignFactor[],
  },
}

export const CampaignFactorFeedback:FC<Props> = (props) => {
  const {
    isReal, result,
    model: {
      props: {
        answerIndex = 0,
        campaignFactorResultType = '',
        answerIndexCode = '',
      },
      campaignFactorsList,
    },
  } = props

  if (isReal && !result) { return null }

  const code = result && result[answerIndex - 1]?.code

  const campaignFactor = campaignFactorsList.find(item => item.code === code)

  if (campaignFactorResultType === 'code') {
    return <div>{getFeedbackByCode(result, answerIndexCode)}</div>
  }

  if (campaignFactorResultType === 'feedback') {
    return <div>{(result && result[answerIndex - 1]?.value) || ''}</div>
  }

  if (campaignFactorResultType === 'name') {
    return <div>{campaignFactor?.name || ''}</div>
  }

  return null
}

const getFeedbackByCode = (result: CampaignFactorModel[]|null, code: string | number) => {
  if (!result) { return '' }
  return (_.find(
    result, { code },
  ) as CampaignFactorModel)?.value || ''
}
