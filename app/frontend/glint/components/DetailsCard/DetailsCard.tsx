import React, { FC } from 'react'
import {
  Card, Col, Typography, Progress, Row, Tooltip, Space, Button, Popover, Flex,
} from 'antd'
import cs from 'classnames'
import { DirectionalArrowIcon, ScrollToViewOnFocusButton } from '~/glint'

import styles from './styles.less'
import {
  InfoCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

const { Title } = Typography
type DetailsCardProps = {
  title: string | React.ReactElement
  titleId?: string
  titleHeadingLevel?: 1 | 5 | 2 | 3 | 4
  description?: string | React.ReactElement
  buttonText?: string
  buttonId?: string
  secondaryBtnText?: string
  secondaryBtnId?: string
  onButtonClick?: () => void
  onSecondaryBtnClick?: () => void
  progressPercentage?: number
  progressLabelAria?: string
  status?: string | React.ReactElement
  subtitle?: string | React.ReactElement | null
  showStatusAtTop?: boolean
  actionLoading?: boolean
  actionDisabled?: boolean
  actionDisabledText?: string
  footer?: React.ReactNode
  className?: string
  hideTitleHighlighter?: boolean
  showReadinessCheck? :boolean
  onReadinessCheckClick?: () => void
}

const { I18n } = window

export const DetailsCard: FC<DetailsCardProps> = ({
  title,
  titleId,
  titleHeadingLevel,
  buttonText,
  buttonId,
  secondaryBtnText,
  secondaryBtnId,
  onButtonClick,
  onSecondaryBtnClick,
  progressPercentage,
  progressLabelAria,
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
  showReadinessCheck,
  onReadinessCheckClick,
}) => {
  const handleClick = () => {
    onButtonClick && onButtonClick()
  }


  const titleElement = (
    <Title
      className={cs({ [styles.title]: true, [styles.highlight]: !hideTitleHighlighter })}
      level={titleHeadingLevel}
    >
      {title}
    </Title>
  )

  let progressBarSpanLg = showStatusAtTop ? 6 : 12
  let progressBarSpanXs = 12
  if (secondaryBtnText && buttonText) {
    progressBarSpanLg = 4
    progressBarSpanXs = 6
  }

  if (showReadinessCheck) {
    progressBarSpanLg = 10
    progressBarSpanXs = 8
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
      <Space orientation="vertical" className="w-100">
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
      <Row className={styles.cardFooter} wrap>
        <Col
          lg={progressPercentage !== undefined ? progressBarSpanLg : 0}
          md={progressPercentage !== undefined ? progressBarSpanLg : 0}
          xs={progressPercentage !== undefined ? progressBarSpanXs : 0}
          style={showReadinessCheck ? { minWidth: '100px', marginBottom: '1rem' } : {}}
        >
          {progressPercentage !== undefined && (
            <Progress
              aria-label={progressLabelAria}
              percent={progressPercentage}
            />
          )}
        </Col>
        {showReadinessCheck ? (
          <Col
            flex={progressPercentage !== undefined ? '1 1 200px' : 1}
            className={cs({ [styles.buttonCol]: true, [styles.withFooter]: footer })}
          >
            <Flex justify="end">
              <ScrollToViewOnFocusButton
                type="primary"
                onClick={onReadinessCheckClick}
                style={{
                  marginInlineEnd: '0.25rem',

                }}
              >
                {I18n.t('enduser.start_readiness_check')}
                <DirectionalArrowIcon aria-label="" className={styles.buttonIcon} />
              </ScrollToViewOnFocusButton>
              <Popover
                placement="top"
                trigger={['click', 'hover']}
                content={(
                  <section style={{ maxWidth: '200px' }}>
                    {I18n.t('enduser.begin_message')}
                  </section>
                )}
              >
                <Button
                  style={{
                    height: '1.4rem',
                    width: '1rem',
                  }}
                  type="link"
                  className="p-0 mb-1"
                  icon={<InfoCircleOutlined />}
                />
              </Popover>
            </Flex>
          </Col>

        ) : (
          <>
            {buttonText && (
              <Col
                lg={progressPercentage !== undefined ? 24 - progressBarSpanLg : 24}
                md={progressPercentage !== undefined ? 16 : 24}
                xs={progressPercentage !== undefined ? 24 - progressBarSpanXs : 24}
                className={cs({ [styles.buttonCol]: true, [styles.withFooter]: footer })}
              >
                <Flex gap={8} wrap justify="end">
                  {secondaryBtnText && (
                    <ButtonWrapper wrapText={actionDisabled ? actionDisabledText : undefined}>
                      <ScrollToViewOnFocusButton
                        id={secondaryBtnId}
                        type="primary"
                        disabled={actionDisabled}
                        ghost
                        onClick={onSecondaryBtnClick}
                        className={styles.actionButton}
                        aria-labelledby={`${secondaryBtnId} ${titleId}`}
                      >
                        {secondaryBtnText}
                        <DirectionalArrowIcon aria-label="" className={styles.buttonIcon} />
                      </ScrollToViewOnFocusButton>
                    </ButtonWrapper>
                  )}
                  <ButtonWrapper wrapText={actionDisabled ? actionDisabledText : undefined}>
                    <ScrollToViewOnFocusButton
                      id={buttonId}
                      loading={actionLoading}
                      type="primary"
                      disabled={actionDisabled}
                      onClick={handleClick}
                      className={styles.actionButton}
                      aria-labelledby={`${buttonId} ${titleId}`}
                    >
                      {buttonText}
                      <DirectionalArrowIcon aria-label="" className={styles.buttonIcon} />
                    </ScrollToViewOnFocusButton>
                  </ButtonWrapper>
                </Flex>
              </Col>
            )}
          </>
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
  ? <Tooltip title={wrapText} className="pe-0" placement="topLeft"><span>{children}</span></Tooltip>
  : children)
