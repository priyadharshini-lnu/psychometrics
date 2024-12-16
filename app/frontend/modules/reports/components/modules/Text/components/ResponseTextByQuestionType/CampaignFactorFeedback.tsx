import _ from 'lodash'
import { FC } from 'react'
import { CampaignFactorModel } from 'modules/survey/interfaces/questions/CampaignFactorFeedback'
import AppStore from '~/modules/reports/store/AppStore'

type Props = {
  isReal: boolean,
  result: CampaignFactorModel[] | null,
  model: {
    assessment_id: number
    props: {
      answerIndex: number,
      answerIndexCode: string,
      campaignFactorResultType: string,
    },
  },
}

export const CampaignFactorFeedback:FC<Props> = (props) => {
  const {
    isReal, result,
    model: {
      assessment_id,
      props: {
        answerIndex = 0,
        campaignFactorResultType = '',
        answerIndexCode = '',
      },
    },
  } = props

  if (isReal && !result) { return null }

  const code = result && result[answerIndex - 1]?.code

  const campaignFactorsList = AppStore.getAssessmentById(assessment_id)?.campaignFactorsList || []
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

export const CampaignFactorResult = (props: Props) => {
  const {
    result,
    model: {
      assessment_id,
      props: {
        answerIndex = 0,
        campaignFactorResultType = '',
        answerIndexCode = '',
      },
    },
  } = props

  const campaignFactorsList = AppStore.getAssessmentById(assessment_id)?.campaignFactorsList || []
  const code = result && result[answerIndex - 1]?.code
  const campaignFactor = campaignFactorsList.find(item => item.code === code)

  if (campaignFactorResultType === 'code') {
    return getFeedbackByCode(result, answerIndexCode)
  }

  if (campaignFactorResultType === 'feedback') {
    return (result && result[answerIndex - 1]?.value) || ''
  }

  if (campaignFactorResultType === 'name') {
    return campaignFactor?.name || ''
  }
  return ''
}
