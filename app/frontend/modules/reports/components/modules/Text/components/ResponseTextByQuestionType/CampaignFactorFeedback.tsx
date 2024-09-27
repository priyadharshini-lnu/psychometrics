import _ from 'lodash'
import { FC } from 'react'
import { CampaignFactorModel } from 'modules/survey/interfaces/questions/CampaignFactorFeedback'

type Props = {
  isReal: boolean,
  result: CampaignFactorModel[],
  model: {
    props: {
      answerIndex: number,
    },
  },
}

export const CampaignFactorFeedback:FC<Props> = (props) => {
  const {
    isReal, result,
    model: {
      props: {
        answerIndex = '0',
      },
    },
  } = props

  if (isReal && !result) { return null }

  const text = (_.find(result, { code: answerIndex }) as CampaignFactorModel)?.value

  return <div>{text || ''}</div>
}
