/* eslint-disable react/no-danger */
import React from 'react'
import { Collapse, Button } from 'antd'
import { CaretRightOutlined } from '@ant-design/icons'
import DOMPurify from 'dompurify'
import styles from './styles'

const { Panel } = Collapse

export default function InstructionsPanel ({
  instructionsEnabled, instructions, showBegin, onBegin,
}) {
  const activePanels = [
    ...(instructionsEnabled ? '1' : []),
    ...(showBegin ? '2' : []),
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
            showArrow={false}
            className={styles.customPanel}
          >
            {<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(instructions) }} />}
          </Panel>
        )}
        {showBegin && (
          <Panel key="2" showArrow={false}>
            <Button
              type="primary"
              onClick={onBegin}
            >
              <CaretRightOutlined />
              {I18n.t('campaign.begin')}
            </Button>
          </Panel>
        )}
      </Collapse>
    </div>
  )
}
