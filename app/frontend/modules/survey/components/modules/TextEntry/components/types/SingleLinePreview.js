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
        result,
        props: { type },
      },
      model,
    } = this.props

    const value = (result.answers[0] && result.answers[0].value) || ''

    return (
      <div>
        <Row>
          <Col span={24}>
            <Input
              autoComplete="off"
              disabled={readOnly}
              onChange={this.changeAnswer}
              value={value}
              type={type === 'SingleLine' ? 'text' : 'password'}
            />
          </Col>
        </Row>
        <TextEntryCounter model={model} />
      </div>
    )
  }
}
