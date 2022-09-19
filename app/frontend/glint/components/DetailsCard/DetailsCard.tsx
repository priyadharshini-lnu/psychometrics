import React, { FC } from 'react'
import {
  Card, Col, Button, Typography, Progress, Row, Tooltip, Space,
} from 'antd'

import { DirectionalArrowIcon } from 'glint'

import styles from './styles.less'

const { Title } = Typography
type DetailsCardProps = {
  title: string | React.ReactElement
  description?: string | React.ReactElement
  buttonText?: string
  handleButtonClick?: () => void
  progressPercentage?: number
  status?: string | React.ReactElement
  subtitle?: string | React.ReactElement
  showStatusAtTop?: boolean
  actionLoading?: boolean
  actionDisabled?: boolean
  actionDisabledText?: string
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
  actionLoading,
  actionDisabled,
  actionDisabledText,
}) => {
  const handleClick = () => {
    handleButtonClick && handleButtonClick()
  }

  const titleElement = (
    <Title className={styles.title} level={5}>
      {title}
    </Title>
  )

  const progressBarSpan = showStatusAtTop ? 6 : 12

  return (
    <Card className={styles.detailsCard}>
      {showStatusAtTop && (
      <Row>
        <Col xs={18} sm={12}>{titleElement}</Col>
        <Col xs={6} sm={12} className="ta-e">
          {status}
        </Col>
      </Row>
      )}
      <Space direction="vertical">
        {!showStatusAtTop && (
        <Row>
          <Col span={24}>{titleElement}</Col>
          <Col span={24}>{status}</Col>
        </Row>
        )}
        <Row align="middle">
          {subtitle}
        </Row>
        <div className="mb-4">
          <Typography.Text>{description}</Typography.Text>
        </div>
      </Space>
      <Row className={styles.cardFooter}>
        <Col lg={progressBarSpan} md={8} xs={12}>
          <Progress percent={progressPercentage} />
        </Col>
        {buttonText && (
          <Col lg={24 - progressBarSpan} md={16} xs={12} className={styles.buttonCol}>
            <ButtonWrapper wrapText={actionDisabled ? actionDisabledText : undefined}>
              <Button
                loading={actionLoading}
                type="primary"
                disabled={actionDisabled}
                size="small"
                onClick={handleClick}
                className={styles.actionButton}
              >
                {buttonText}
                <DirectionalArrowIcon className={styles.buttonIcon} />
              </Button>
            </ButtonWrapper>
          </Col>
        )}
      </Row>
    </Card>
  )
}

type ButtonWrapperProps = {
  wrapText: string | undefined,
children: React.ReactElement,
}

const ButtonWrapper: FC<ButtonWrapperProps> = ({ wrapText, children }) => (wrapText
  ? <Tooltip title={wrapText} placement="topLeft">{children}</Tooltip>
  : children)
