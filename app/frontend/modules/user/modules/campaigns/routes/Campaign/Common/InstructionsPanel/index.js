/* eslint-disable react/no-danger */
import React from 'react'
import { Collapse, Button } from 'antd'
import { CaretRightOutlined } from '@ant-design/icons'
import DOMPurify from 'dompurify'
import styles from './styles'

const { Panel } = Collapse

export default function InstructionsPanel ({
  instructions, showBegin, onBegin,
}) {
  return (
    <div className={styles.container}>
      <Collapse
        bordered={false}
        defaultActiveKey={showBegin ? '1' : null}
        className={styles.customCollapse}
      >
        <Panel
          header="Instructions to follow"
          key="1"
          showArrow={false}
          className={styles.customPanel}
        >
          {<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(instructions) }} />}

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
      </Collapse>
    </div>
  )
}
