import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Input, Row, Col } from 'antd'

import { TextEntryCounter } from '../components/TextEntryCounter'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeAnswer = (event) => {
    const { model } = this.props
    const {
      currentTarget: { value },
    } = event

    model.result.answer(value)
    this.forceUpdate()
  }

  render () {
    const {
      readOnly,
      model: {
        props: { type },
        result,
      },
      model,
    } = this.props

    const value = result?.answers?.[0]?.value ?? ''

    return (
      <div>
        <Row>
          <Col span={24}>
            <Input.TextArea
              autoComplete="off"
              disabled={readOnly}
              rows={type === 'MultiLine' ? 3 : 6}
              className="w-100"
              onChange={this.changeAnswer}
              value={value}
            />
          </Col>
        </Row>
        <TextEntryCounter model={model} />
      </div>
    )
  }
}
