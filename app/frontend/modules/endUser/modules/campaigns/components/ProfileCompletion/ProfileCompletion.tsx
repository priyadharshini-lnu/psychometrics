import { FC } from 'react'
import {
  Row, Col, Progress, Typography, Button, Space,
} from 'antd'

import { DirectionalArrowIcon } from '~/glint'

import styles from './ProfileCompletion.less'

const { I18n } = window
const { Text, Title } = Typography
type Props = {
  title: string,
  subTitle?: string,
  completionPercent: number,
  isMobile?: boolean,
  handleComplete?: () => void,
}

export const ProfileCompletion:FC<Props> = ({
  title, subTitle, completionPercent, handleComplete, isMobile,
}) => {
  const progressBarColSpan = isMobile ? 8 : 6
  return (
    <Row>
      <Col span={24 - progressBarColSpan}>
        <Title className="fs-16" level={2}>{title}</Title>
        <Space size="middle" direction="vertical">
          {subTitle && <Text>{subTitle}</Text>}
          {completionPercent === 100 ? (
            <Button type="link" className={styles.editLink} onClick={handleComplete}>
              {I18n.t('campaign.profile.edit_profile_label')}
              {' '}
            </Button>
          )
            : (
              <Button type="primary" onClick={handleComplete}>
                {I18n.t('campaign.profile.complete_profile_label')}
                {' '}
                <DirectionalArrowIcon />
              </Button>
            )}
        </Space>
      </Col>
      <Col span={progressBarColSpan} className={styles.progressCol}>
        <Progress
          aria-label={I18n.t('frontend.aria.profile_progress')}
          size={isMobile ? 'small' : 'default'}
          percent={completionPercent}
          type="circle"
        />
      </Col>
    </Row>
  )
}
