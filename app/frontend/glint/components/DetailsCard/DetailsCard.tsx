import React, { FC } from 'react'
import {
  Card, Col, Button, Typography, Progress, Row,
} from 'antd'
import { RightOutlined } from '@ant-design/icons'

import styles from './styles.less'

const { Title } = Typography

type DetailsCardProps = {
  title: string | React.ReactElement
  description: string | React.ReactElement
  buttonText?: string
  handleButtonClick?: () => void
  progressPercentage?: number
  status?: string | React.ReactElement
  subtitle?: string | React.ReactElement
  showStatusAtTop?: boolean
}

export const DetailsCard: FC<DetailsCardProps> = ({
  title,
  buttonText,
  handleButtonClick,
  progressPercentage,
  description,
  status,
  subtitle,
  showStatusAtTop,
}) => {
  const handleClick = () => {
    handleButtonClick && handleButtonClick()
  }

  const titleElement = (
    <Title className={styles.title} level={5}>
      {title}
    </Title>
  )

  const titleRow = showStatusAtTop ? (
    <Row>
      <Col span={12}>{titleElement}</Col>
      <Col span={12} className="ta-e">
        {status}
      </Col>
    </Row>
  ) : (
    <>
      <Row>
        <Col span={24}>{titleElement}</Col>
        <Col span={24}>{status}</Col>
      </Row>
    </>
  )

  const progressBarSpan = showStatusAtTop ? 6 : 12

  return (
    <Card bodyStyle={{ paddingBlock: '10px' }} className={styles.detailsCard}>
      {titleRow}
      {subtitle}
      <p>{description}</p>
      <Row>
        <Col lg={progressBarSpan} md={8} xs={12}>
          <Progress percent={progressPercentage} />
        </Col>
        {buttonText && (
          <Col lg={24 - progressBarSpan} md={16} xs={12} className={styles.buttonCol}>
            <Button type="primary" onClick={handleClick}>
              {buttonText}
              <RightOutlined />
            </Button>
          </Col>
        )}
      </Row>
    </Card>
  )
}
