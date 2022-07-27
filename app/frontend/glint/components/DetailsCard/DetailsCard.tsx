import React, { FC, Fragment } from 'react'
import {
  Card, Col, Button, Typography, Progress, Row, Tooltip,
} from 'antd'
import { RightOutlined, LeftOutlined } from '@ant-design/icons'

import { isRtl } from 'utils/locales'

import styles from './styles.less'

const { Title } = Typography
const { I18n } = window
const uiLocale = I18n && I18n.uiLocale

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
  const rtl = uiLocale && isRtl(uiLocale)

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
      <Row className={styles.cardFooter}>
        <Col lg={progressBarSpan} md={8} xs={12}>
          <Progress percent={progressPercentage} />
        </Col>
        {buttonText && (
          <Col lg={24 - progressBarSpan} md={16} xs={12} className={styles.buttonCol}>
            <ButtonWrapper wrapText={actionDisabledText}>
              <Button
                loading={actionLoading}
                type="primary"
                disabled={actionDisabled}
                size="small"
                onClick={handleClick}
              >
                {buttonText}
                {rtl ? <LeftOutlined /> : <RightOutlined />}
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
