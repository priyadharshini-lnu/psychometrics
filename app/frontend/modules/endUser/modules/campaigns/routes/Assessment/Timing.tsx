import React from 'react'
import {
  Button, Layout, Col, Typography, Space, Row,
} from 'antd'
import {
  PageHeader as GlintPageHeader,
} from '~/glint'
import styles from './UserAssessment.less'
import { secondsLeftFromNow, secondsToHHMMSS } from '~/utils/time'

const { Content } = Layout
const { I18n } = window

interface Props {
  assessmentName: string
  campaignExpiryDate: string
  totalAssessmentTime: number
  ok: () => void
  onCancel: () => void
}

export const Timing: React.FC<Props> = ({
  assessmentName, campaignExpiryDate, totalAssessmentTime, ok, onCancel,
}) => {
  const remainingCampaignTime = secondsLeftFromNow(campaignExpiryDate)
  return (
    <>
      <GlintPageHeader>
        <Col span={24} className="ta-c">
          <Typography.Title level={3}>
            {I18n.t('campaign.time_left.title')}
          </Typography.Title>
        </Col>
      </GlintPageHeader>
      <Content className={styles.container}>
        <Content className={styles.pageContent}>
          <Row gutter={16}>
            <Col flex={1}>
              {I18n.t('campaign.time_left.notification',
                {
                  assessmentName,
                  totalAssessmentTime: secondsToHHMMSS(totalAssessmentTime),
                  remainingCampaignTime: secondsToHHMMSS(remainingCampaignTime),
                })}
            </Col>
          </Row>
          <div className={styles.footerButtons}>
            <Space>
              <Button danger onClick={onCancel}>
                {I18n.t('campaign.time_left.cancel')}
              </Button>
              <Button type="primary" onClick={() => ok()}>
                {I18n.t('campaign.time_left.continue')}
              </Button>
            </Space>
          </div>
        </Content>
      </Content>
    </>
  )
}
