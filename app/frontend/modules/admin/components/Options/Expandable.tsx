import React from 'react'
import {
  Row, Col, Switch, Checkbox,
} from 'antd'
import cs from 'classnames'
import styles from './styles.scss'

interface Props {
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  actionable?: React.ReactNode
  children?: React.ReactNode
  type?: 'checkbox' | 'switch'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void
}


const Expandable: React.FC<Props> = ({
  label, value, onChange, actionable, children, type,
}) => {
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
                    checked={value}
                    onChange={onChange}
                  />
                </div>
              </Col>
            ) : null}
            <Col md={22} sm={21} xs={20}>
              {type === 'checkbox' && (
                <Checkbox
                  onChange={e => onChange(e.target.checked)}
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

export default Expandable
