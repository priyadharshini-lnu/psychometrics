import React, { useEffect, useState } from 'react'
import {
  Layout,
} from 'antd'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import qs from 'qs'

import { get as getConfig } from '~/modules/endUser/core/config'
import { isRequestInProgress } from '~/core/request'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { get as getCurrentUser } from '~/core/currentUser'
import {
  get as getCampaign, getUserAssessmentData, getCampaignOptions,
} from '~/modules/endUser/modules/campaigns/core/campaign/selectors'
import {
  fetchAssessment, FETCH_RESULTS,
} from '~/modules/endUser/modules/campaigns/core/userAssessment'
import styles from './styles.less'
import { fetchCampaigns } from '~/modules/endUser/modules/campaigns/core/campaigns'
import { DocumentTitle } from '~/components/DocumentTitle'

const InteractiveAssessmentsModule = () => import('@thetalententerprise/interactive-assessments')

const connector = connect(
  (state: RootState) => ({
    ...getConfig(state),
    isAnonym: getCurrentUser(state).isAnonym,
    campaignId: getCampaign(state).id,
    userAssessment: getUserAssessmentData(state),
    assessment: state.campaigns.userAssessment.assessment,
    campaignOptions: getCampaignOptions(state),
    resultsLoading: isRequestInProgress(state, FETCH_RESULTS),
  }),
  {
    fetchAssessment,
    fetchCampaigns,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connector>

const { Content } = Layout

type Params = {
  userAssessmentId: string
}
interface OwnProps {
  agileUserAssessmentUrl?: string,
  agileUserAssessmentId?: string
}

type Props = OwnProps & PropsFromRedux

const AgileUserAssessmentComponent: React.FC<Props> = ({
  agileAssetsUrl,
  agileUserAssessmentUrl,
  agileUserAssessmentId,
  isAnonym,
  campaignId: agileCampaign,
  assessment,
  userAssessment,
  fetchAssessment,
  campaignOptions,
  resultsLoading,
  fetchCampaigns,
}) => {
  const campaignId = agileCampaign || userAssessment.campaignId
  const params = useParams() as Params

  const [assessmentLoading, setAssessmentLoading] = useState(true)
  const initializeAgile = () => {
    const { lang } = qs.parse(location.search.substr(1))
    const appOptions = {
      scale: {
        parent: 'agile-container',
      },
      service: {
        baseURL: agileUserAssessmentUrl || window.location.href.split('?')[0],
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-Token': document.querySelector("meta[name='csrf-token']")?.getAttribute('content') as string,
        },
      },
      settings: {
        returnURL: isAnonym ? '' : `/assessment_completed/${campaignId}`,
        assetsBaseURL: agileAssetsUrl,
        locale: lang?.toString(),
        watermark: campaignOptions?.show_watermark ? campaignOptions.watermark_content : null,
        exitURL: isAnonym ? '' : `/campaigns/${campaignId}`,
      },
    }
    InteractiveAssessmentsModule().then(({ InteractiveAssessments }) => {
      InteractiveAssessments.init(appOptions)
    })
  }

  const getCampaignSystemCheckDetails = async (campaignId) => {
    if (!campaignId) {
      return
    }
    const { response } = await fetchCampaigns()
    const currentCampaign = response.filter(campaign => campaign.id === campaignId)[0]

    if (currentCampaign?.isSystemCheckEnabled
        && !currentCampaign.systemCheckStatus?.isValid
        && currentCampaign?.progressStatus !== 'completed') {
      window.location.href = '/dashboard'
    } else { setAssessmentLoading(false) }
  }

  useEffect(() => {
    const { edit } = qs.parse(location.search.substr(1))
    const assessmentId = params.userAssessmentId ?? agileUserAssessmentId

    fetchAssessment(assessmentId, edit).then(() => {
      getCampaignSystemCheckDetails(campaignId)
    })
  }, [])

  useEffect(() => {
    if (!assessmentLoading && !resultsLoading) {
      initializeAgile()
    }
  }, [assessmentLoading, resultsLoading])

  return (
    <>
      <DocumentTitle text={assessment.name} />
      <Content className={styles.agileContent}>
        <div id="agile-container" className={styles.agileContainer} />
      </Content>
    </>
  )
}

export const AgileUserAssessment = connector(AgileUserAssessmentComponent)
