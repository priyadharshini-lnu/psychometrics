import React from 'react'
import {
  Switch, Row, Col,
} from 'antd'
import I18n from 'admin/core/common/I18n'
import css from './style.scss'

export default function ({ instructionTemplate, toggleEnabled }) {
  return (
    <div className={css.container}>
      <Row className={css.titleContainer}>
        <Col md={14} lg={16} xl={18}>
          <div className={css.title}>
            {I18n.t(`administration.threesixty_campaigns.instruction_templates.${instructionTemplate.name}.name`)}
          </div>
          <div>
            {/* eslint-disable-next-line max-len */}
            {I18n.t(`administration.threesixty_campaigns.instruction_templates.${instructionTemplate.name}.description`)}
          </div>
        </Col>
        <Col md={10} lg={8} xl={6}>
          <Switch className={css.switch} checked={instructionTemplate.enabled} onChange={toggleEnabled} />
        </Col>
      </Row>
    </div>
  )
}
