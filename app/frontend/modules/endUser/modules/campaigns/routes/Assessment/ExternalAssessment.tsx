import { FC } from 'react'
import {
  Layout, Col, Typography, Button, Space,
} from 'antd'

import cs from 'classnames'
import { PageHeader as GlintPageHeader } from '~/glint'
import styles from './UserAssessment.less'
import RedirectIcon from './RedirectIcon'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import {
  AsyncRequestResponseTR,
  AsyncRequestResponse,
} from '~/modules/admin/modules/client/core/asyncRequestResponse'

const { I18n } = window
const { Content } = Layout

interface Props {
  userAssessmentId: string
  userAssessmentUrl: string
  onCancel: () => void
}

export const ExternalAssessment: FC<Props> = ({
  userAssessmentId,
  userAssessmentUrl,
  onCancel,
}) => {
  const {
    asyncLoading: loading, makeAsyncRequest: startAssessment,
  } = useAsyncRequestResponse<AsyncRequestResponse>({
    url: userAssessmentUrl,
    data: { id: userAssessmentId },
    responseType: AsyncRequestResponseTR,
    numberOfTimesToPoll: 5,
    pollingInterval: 10,
  })

  const process = async () => {
    startAssessment()
  }

  return (
    <>
      <GlintPageHeader>
        <Col offset={4} span={16} className="ta-c">
          <Typography.Title level={3}>
            {I18n.t('assessments.categories.redirecting')}
          </Typography.Title>
        </Col>
        <Col span={4} className="ta-e" />
      </GlintPageHeader>
      <Content className={cs(styles.pageContent, styles.external)}>
        <div className={styles.icon}>
          <RedirectIcon />
        </div>
        <div>{I18n.t('enduser.redirect_to_external_assessment')}</div>
        <div className={styles.redirectFooter}>
          <Space>
            <Button onClick={onCancel}>
              {I18n.t('campaign.time_left.cancel')}
            </Button>
            <Button
              type="primary"
              loading={loading}
              disabled={loading}
              onClick={() => process()}
            >
              {I18n.t('campaign.time_left.continue')}
            </Button>
          </Space>
        </div>
      </Content>
    </>
  )
}
