import React from 'react'
import { Collapse, Button } from 'antd'
import { CaretRightOutlined } from '@ant-design/icons'

import { SafeHTML } from 'components/SafeHTML'

import styles from './styles'

const { Panel } = Collapse

export default function InstructionsPanel ({
  instructionsEnabled, instructions, showBegin, showContinue, onBegin, onContinue,
}) {
  const showActions = showBegin || showContinue
  const activePanels = [
    ...(instructionsEnabled ? '1' : []),
    ...(showActions ? '2' : []),
  ]

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
              sanitizeConfig={{ ADD_TAGS: ['iframe'] }}
            />
          </Panel>
        )}
        {showActions && (
          <Panel key="2" showArrow={false}>
            {showContinue && (
              <Button
                type="primary"
                onClick={onContinue}
              >
                <CaretRightOutlined />
                {I18n.t('campaign.continue')}
              </Button>
            )}
            {showBegin && (
              <Button
                type="primary"
                onClick={onBegin}
              >
                <CaretRightOutlined />
                {I18n.t('campaign.begin')}
              </Button>
            )}
          </Panel>
        )}
      </Collapse>
    </div>
  )
}
