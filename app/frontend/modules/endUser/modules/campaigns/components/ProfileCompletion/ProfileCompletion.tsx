import React, { FC } from 'react'
import {
  Row, Col, Progress, Typography, Button, Space,
} from 'antd'

import { DirectionalArrowIcon } from 'glint'

import styles from './ProfileCompletion.less'

const { I18n } = window
const { Text, Title } = Typography
type Props = {
  title: string,
  subTitle?: string,
  completionPercent: number,
  handleComplete?: () => void,
}

export const ProfileCompletion:FC<Props> = ({
  title, subTitle, completionPercent, handleComplete,
}) => (
  <Row>
    <Col span={18}>
      <Title level={5}>{title}</Title>
      <Space size="middle" direction="vertical">
        <Text>{subTitle}</Text>
        <Button type="primary" onClick={handleComplete}>
          {I18n.t('campaign.profile.complete_profile_label')}
          {' '}
          <DirectionalArrowIcon />
        </Button>
      </Space>
    </Col>
    <Col span={6} className={styles.progressCol}>
      <Progress percent={completionPercent} type="circle" />
    </Col>
  </Row>
)
