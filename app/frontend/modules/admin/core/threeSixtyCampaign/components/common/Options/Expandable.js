import React from 'react'
import {
  Row, Col, Switch, Checkbox,
} from 'antd'
import cs from 'classnames'
import styles from './styles.scss'

export default function Expandable ({
  label, value, onOptionChanged, actionable, children, type,
}) {
  const renderExpandableBlock = () => {
    if (!value || !children) return null
    return <div className={cs({ [styles.checkboxContainer]: type === 'checkbox' })}>{children}</div>
  }

  const renderActionable = () => {
    if (!value || !actionable) return null
    return <span className="mlh">{actionable}</span>
  }

  return (
    <div className={cs({ mbs: type === 'checkbox', mbl: type !== 'checkbox' })}>
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
              {type === 'checkbox' && (
                <Checkbox
                  onChange={e => onOptionChanged(e.target.checked)}
                  checked={value}
                  className="mrs"
                />
              )}
              {label}
              {renderActionable()}
              {renderExpandableBlock()}
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}
