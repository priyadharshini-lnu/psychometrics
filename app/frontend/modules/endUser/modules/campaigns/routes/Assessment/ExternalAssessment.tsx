import { FC } from 'react'
import {
  Layout, Col, Typography, Button, Space,
} from 'antd'
import cs from 'classnames'
import {
  PageHeader as GlintPageHeader,
} from '~/glint'
import styles from './UserAssessment.less'
import RedirectIcon from './RedirectIcon'

const { I18n } = window
const { Content } = Layout

interface Props {
  userAssessmentUrl: string
  onCancel: () => void
}

export const ExternalAssessment: FC<Props> = ({ userAssessmentUrl, onCancel }) => {
  const process = () => {
    location.href = userAssessmentUrl
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
        <div>
          {I18n.t('user_assessments.redirect')}
        </div>
        <div className={styles.redirectFooter}>
          <Space>
            <Button onClick={onCancel}>
              {I18n.t('campaign.time_left.cancel')}
            </Button>
            <Button type="primary" onClick={() => process()}>
              {I18n.t('campaign.time_left.continue')}
            </Button>
          </Space>
        </div>
      </Content>
    </>
  )
}
