import { Component } from 'react'
import PropTypes from 'prop-types'
import DataSource from '~/modules/reports/components/DataSourceMenu'

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
