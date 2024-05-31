import React, { FC } from 'react'
import {
  Card, Col, Button, Typography, Progress, Row, Tooltip, Space,
} from 'antd'
import cs from 'classnames'

import { DirectionalArrowIcon } from '~/glint'

import styles from './styles.less'

const { Title } = Typography
type DetailsCardProps = {
  title: string | React.ReactElement
  description?: string | React.ReactElement
  buttonText?: string
  buttonAriaDescription?: string
  secondaryBtnText?: string
  secondaryBtnAriaDescription?: string
  onButtonClick?: () => void
  onSecondaryBtnClick?: () => void
  progressPercentage?: number
  status?: string | React.ReactElement
  subtitle?: string | React.ReactElement | null
  showStatusAtTop?: boolean
  actionLoading?: boolean
  actionDisabled?: boolean
  actionDisabledText?: string
  footer?: React.ReactNode
  className?: string
  hideTitleHighlighter?: boolean
}

export const DetailsCard: FC<DetailsCardProps> = ({
  title,
  buttonText,
  buttonAriaDescription,
  secondaryBtnText,
  secondaryBtnAriaDescription,
  onButtonClick,
  onSecondaryBtnClick,
  progressPercentage,
  description,
  status,
  subtitle,
  showStatusAtTop,
  actionLoading,
  actionDisabled,
  actionDisabledText,
  footer,
  className,
  hideTitleHighlighter,
}) => {
  const handleClick = () => {
    onButtonClick && onButtonClick()
  }

  const titleElement = (
    <Title className={cs({ [styles.title]: true, [styles.highlight]: !hideTitleHighlighter })} level={5}>
      {title}
    </Title>
  )

  let progressBarSpanLg = showStatusAtTop ? 6 : 12
  let progressBarSpanXs = 12
  if (secondaryBtnText && buttonText) {
    progressBarSpanLg = 4
    progressBarSpanXs = 6
  }

  return (
    <Card className={cs({ [styles.detailsCard]: true, [styles.withFooter]: footer, [`${className}`]: className })}>
      {showStatusAtTop && (
      <Row>
        <Col xs={18}>{titleElement}</Col>
        <Col xs={6} className="ta-e">
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
        <Col lg={progressBarSpanLg} md={8} xs={progressBarSpanXs}>
          {progressPercentage !== undefined && <Progress percent={progressPercentage} />}
        </Col>
        {buttonText && (
          <Col
            lg={24 - progressBarSpanLg}
            md={16}
            xs={24 - progressBarSpanXs}
            className={cs({ [styles.buttonCol]: true, [styles.withFooter]: footer })}
          >
            <Space>
              {secondaryBtnText && (
              <ButtonWrapper wrapText={actionDisabled ? actionDisabledText : undefined}>
                <Button
                  size="small"
                  type="primary"
                  disabled={actionDisabled}
                  ghost
                  onClick={onSecondaryBtnClick}
                  className={styles.actionButton}
                  aria-description={secondaryBtnAriaDescription || ''}
                >
                  {secondaryBtnText}
                  <DirectionalArrowIcon aria-label="" className={styles.buttonIcon} />
                </Button>
              </ButtonWrapper>
              )}
              <ButtonWrapper wrapText={actionDisabled ? actionDisabledText : undefined}>
                <Button
                  loading={actionLoading}
                  type="primary"
                  disabled={actionDisabled}
                  size="small"
                  onClick={handleClick}
                  className={styles.actionButton}
                  aria-description={buttonAriaDescription || ''}
                >
                  {buttonText}
                  <DirectionalArrowIcon aria-label="" className={styles.buttonIcon} />
                </Button>
              </ButtonWrapper>
            </Space>
          </Col>
        )}
        {footer ? <Col className={cs('w-100', 'ta-c', styles.footer)}>{footer}</Col> : null}
      </Row>
    </Card>
  )
}

type ButtonWrapperProps = {
  wrapText: string | undefined,
  children: React.ReactElement,
}

const ButtonWrapper: FC<ButtonWrapperProps> = ({ wrapText, children }) => (wrapText
  ? <Tooltip title={wrapText} className="pe-0" placement="topLeft">{children}</Tooltip>
  : children)
