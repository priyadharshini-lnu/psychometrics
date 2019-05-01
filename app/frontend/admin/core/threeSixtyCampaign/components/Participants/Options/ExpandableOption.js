import React from 'react'
import {
  Row, Col, Switch, Checkbox,
} from 'antd'
import css from './Options.scss'

export default function ExpandableOption ({
  label, value, onOptionChanged, actionable, children, type,
}) {
  function renderExapandableBlock () {
    if (value && children) {
      return <div className={type === 'checkbox' ? css.checkboxContained : {}}>{children}</div>
    }
    return null
  }

  function renderActionable () {
    if (value && actionable) {
      return <span className={css.actionableContainer}>{actionable}</span>
    }
    return null
  }

  return (
    <div style={{ marginBottom: `${type === 'checkbox' ? '5px' : '20px'}` }}>
      <Row>
        <Col span={24}>
          <Row>
            {type !== 'checkbox' ? (
              <Col md={2} sm={3} xs={4}>
                <div>
                  <Switch
                    checkedChildren="On"
                    unCheckedChildren="Off"
                    defaultChecked
                    checked={value}
                    onChange={onOptionChanged}
                  />
                </div>
              </Col>
            ) : null}
            <Col md={22} sm={21} xs={20}>
              {type === 'checkbox' ? (
                <Checkbox
                  onChange={e => onOptionChanged(e.target.checked)}
                  checked={value}
                  style={{ marginRight: '5px' }}
                />
              ) : null}
              {label}
              {renderActionable()}
              {renderExapandableBlock()}
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}
