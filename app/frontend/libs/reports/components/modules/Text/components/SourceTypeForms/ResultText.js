import React, { Component } from 'react'
import DataSource from 'rb/components/DataSourceMenu'
import PropTypes from 'prop-types'

export default class ResultText extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  onSelect = () => {
    const { update } = this.props
    update()
  }

  render () {
    const { model } = this.props
    return (
      <div>
        <DataSource model={model} onSelect={this.onSelect} singleChoice />
      </div>
    )
  }
}
