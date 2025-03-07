import { useContext } from 'react'
import {
  Row, Col, Progress, Alert, Card,
} from 'antd'
import _ from 'lodash'
import { connect } from 'react-redux'

import { fetchCampaign, reset as resetCampaign } from '~/modules/endUser/modules/campaigns/core/campaign'
import {
  getNominations, getEvaluations, getManagedSubjects,
  getApprovalNominations, getSubjectReport, getTotalProgress,
} from '~/modules/endUser/modules/campaigns/core/campaign/selectors'
import { STATUSES } from '~/constants/campaign'
import { SafeHTML } from '~/components/SafeHTML'
import { MediaQueryContext } from '~/glint'
import { CampaignPageHeader } from '../Common/CampaignPageHeader'
import { NominationList } from './NominationList'
import { EvaluationList } from './EvaluationList'
import { ReportList } from './ReportList'

import styles from './Threesixty.less'

const { I18n } = window
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connector = connect((state:any) => ({
  loaded: state.campaigns.campaign.loaded,
  campaign: state.campaigns.campaign,
  instructions: state.campaigns.campaign.instructions,
  evaluationsCounters: state.campaigns.campaign.evaluationsCounters,
  nominationsCounters: state.campaigns.campaign.nominationsCounters,
  reportsCounters: state.campaigns.campaign.reportsCounters,
  nominations: getNominations(state.campaigns).length
               + getApprovalNominations(state.campaigns).length,
  evaluations: getEvaluations(state.campaigns).length
               + getManagedSubjects(state.campaigns).length,
  reports: state.campaigns.campaign.reports,
  subjectReport: getSubjectReport(state.campaigns),
  totalProgress: getTotalProgress(state.campaigns.campaign),
}),
{
  fetchCampaign,
  resetCampaign,
})

const ThreesixtyComponent = ({
  instructions, campaign, evaluationsCounters,
  nominationsCounters, reportsCounters, totalProgress,
}) => {
  const { isMobile } = useContext(MediaQueryContext)
  const colFlex = isMobile ? '' : 'auto'
  const nominationsPercent = (nominationsCounters.completedNominations / nominationsCounters.totalNominations) * 100
  const evaluationsPercent = (evaluationsCounters.completedEvaluations / evaluationsCounters.totalEvaluations) * 100
  const reportsPercent = (reportsCounters.completedReports / reportsCounters.totalReports) * 100
  const subjectWelcomeMessage = _.find(instructions, { name: 'welcome_message' })
  const evaluatorWelcomeMessage = _.find(instructions, { name: 'evaluator_welcome' })
  const welcomeMessage = campaign.isSubject ? subjectWelcomeMessage : evaluatorWelcomeMessage || subjectWelcomeMessage
  const camapaignClosed = campaign.status === STATUSES.CLOSED

  return (
    <>
      <h1 className="sr-only">{campaign.assessmentName}</h1>
      <CampaignPageHeader
        activeCampaignId={campaign.id}
        extra={(
          <Row style={{ minWidth: '200px' }}>
            <Col span={24}>
              <Progress
                strokeColor="#fff"
                className={styles.progressStatus}
                percent={_.round(totalProgress)}
              />
            </Col>
          </Row>
        )}
      />
      {camapaignClosed && (
        <div>
          <Alert message={I18n.t('threesixty.closed_campaign_message')} type="info" showIcon />
        </div>
      )}
      <Row justify="center" className={styles.listContainer}>
        <Col xs={24} lg={22} xl={20} xxl={14}>
          <>
            {welcomeMessage && (
              <Card>
                <SafeHTML html={welcomeMessage.content} config="adminRichText" />
              </Card>
            )}
            <Row gutter={16} wrap={isMobile}>
              {nominationsCounters.totalNominations !== 0 && !camapaignClosed
                && (
                  <Col xs={{ span: 24 }} flex={colFlex} style={{ marginTop: 16 }}>
                    <NominationList percent={nominationsPercent} />
                  </Col>
                )}
              {evaluationsCounters.totalEvaluations !== 0 && !camapaignClosed
                && (
                  <Col xs={{ span: 24 }} flex={colFlex} style={{ marginTop: 16 }}>
                    <EvaluationList percent={evaluationsPercent} />
                  </Col>
                )}
              {reportsCounters.totalReports !== 0
                && (
                  <Col xs={{ span: 24 }} flex={colFlex} style={{ marginTop: 16 }}>
                    <ReportList percent={reportsPercent} />
                  </Col>
                )}
            </Row>
          </>
        </Col>
      </Row>
    </>
  )
}

export const Threesixty = connector(ThreesixtyComponent)
