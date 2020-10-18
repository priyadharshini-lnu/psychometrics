/* eslint-disable react/no-danger */
import React from 'react'
import { Collapse, Button } from 'antd'
import { CaretRightOutlined } from '@ant-design/icons'
import DOMPurify from 'dompurify'
import styles from './styles'

const { Panel } = Collapse

export default function InstructionsPanel ({
  instructionsEnabled, instructions, showBegin, additionalTime, onBegin,
}) {
  const showActions = showBegin || !!additionalTime
  const showInstructions = instructionsEnabled && showActions
  const activePanels = [
    ...(showInstructions ? '1' : []),
    ...(showActions ? '2' : []),
  ]
  const label = additionalTime ? 'campaign.continue' : 'campaign.begin'

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
            showArrow={false}
            className={styles.customPanel}
          >
            {<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(instructions) }} />}
          </Panel>
        )}
        {showActions && (
          <Panel key="2" showArrow={false}>
            <Button
              type="primary"
              onClick={onBegin}
            >
              <CaretRightOutlined />
              {I18n.t(label)}
            </Button>
          </Panel>
        )}
      </Collapse>
    </div>
  )
}
