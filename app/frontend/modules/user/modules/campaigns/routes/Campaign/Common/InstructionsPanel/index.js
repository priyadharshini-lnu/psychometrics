import React from 'react'
import { Collapse, Button, Alert } from 'antd'
import { CaretRightOutlined, CaretLeftOutlined } from '@ant-design/icons'

import { SafeHTML } from 'components/SafeHTML'
import { isRtl } from 'utils/locales'

import styles from './styles.less'

const { Panel } = Collapse
const { I18n } = window

export default function InstructionsPanel ({
  instructionsEnabled, instructions, showBegin, showContinue, onBegin, onContinue,
  proctoringEnabled, enoughProctoringCredits,
}) {
  const showActions = showBegin || showContinue
  const activePanels = [
    ...(instructionsEnabled ? '1' : []),
    ...(showActions ? '2' : []),
  ]
  const rtl = isRtl(I18n.uiLocale)

  return (
    <div className={styles.container}>
      <Collapse
        bordered={false}
        defaultActiveKey={activePanels}
        className={styles.customCollapse}
      >
        {instructionsEnabled && (
          <Panel
            header={I18n.t('campaign.instructions.heading')}
            key="1"
            className={styles.customPanel}
          >
            <SafeHTML
              html={instructions}
              config="adminRichText"
            />
          </Panel>
        )}
        {showActions && (
          <Panel key="2" showArrow={false}>
            {showContinue && (
              <Button
                type="primary"
                onClick={onContinue}
                disabled={proctoringEnabled && !enoughProctoringCredits}
                icon={rtl ? <CaretLeftOutlined /> : <CaretRightOutlined />}
              >
                {I18n.t('campaign.continue')}
              </Button>
            )}
            {proctoringEnabled && !enoughProctoringCredits
              && <Alert message={I18n.t('licenses.not_enough_proctoring_credits')} type="error" />}
            {showBegin && (
              <Button
                type="primary"
                onClick={onBegin}
                disabled={proctoringEnabled && !enoughProctoringCredits}
                icon={rtl ? <CaretLeftOutlined /> : <CaretRightOutlined />}
              >
                {I18n.t('campaign.begin')}
              </Button>
            )}
          </Panel>
        )}
      </Collapse>
    </div>
  )
}
