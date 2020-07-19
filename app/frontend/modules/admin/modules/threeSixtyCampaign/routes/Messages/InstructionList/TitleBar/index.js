import React from 'react'
import {
  Switch, Row, Col,
} from 'antd'
import styles from './styles.scss'

export default function TitleBar ({ instructionTemplate, toggleEnabled }) {
  return (
    <div className={styles.container}>
      <Row className={styles.titleContainer}>
        <Col md={14} lg={16} xl={18}>
          <div className={styles.title}>
            {I18n.t(`administration.threesixty_campaigns.instruction_templates.${instructionTemplate.name}.name`)}
          </div>
          <div>
            {/* eslint-disable-next-line max-len */}
            {I18n.t(`administration.threesixty_campaigns.instruction_templates.${instructionTemplate.name}.description`)}
          </div>
        </Col>
        <Col md={10} lg={8} xl={6}>
          <Switch className={styles.switch} checked={instructionTemplate.enabled} onChange={toggleEnabled} />
        </Col>
      </Row>
    </div>
  )
}
