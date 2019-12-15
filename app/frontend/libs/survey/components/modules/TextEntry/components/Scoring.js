import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FillingScoring from 'components/FillingScoring'
import Utils from 'utils'
import ScoringGradingRow from './components/ScoringGradingRow'

export class Scoring extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    scoring: PropTypes.object.isRequired,
  }

  fillScoring = () => {
    const { model, scoring } = this.props
    if (scoring.isEmptyValues()) {
      scoring.autoFill(model)
    } else {
      scoring.engine.reset()
    }
    this.forceUpdate()
  }

  changeValue = (row, e) => {
    const { scoring } = this.props
    const value = Utils.parseFloat(e.currentTarget ? e.currentTarget.value : e)
    scoring.engine.changeValue(row, value)
    this.forceUpdate()
  }

  changeIndex = (row, e) => {
    const { scoring } = this.props
    scoring.engine.changeIndex(row, e.currentTarget.value)
    this.forceUpdate()
  }

  remove = (row) => {
    const { scoring } = this.props
    scoring.engine.remove(row)
    this.forceUpdate()
  }

  add = () => {
    const { scoring } = this.props
    scoring.engine.add()
    this.forceUpdate()
  }

  toggle = (index) => {
    const { scoring } = this.props
    scoring.toggle(index)
    this.forceUpdate()
  }

  renderFilledScoring () {
    const { scoring } = this.props
    const data = scoring.isEmpty() ? [{ index: null, value: null }] : scoring.props
    return _.flatten(_.map(data, (object, row) => (
      <ScoringGradingRow
        key={row}
        scoring={scoring}
        index={object.index}
        value={object.value}
        row={row}
        onChangeIndex={e => this.changeIndex(row, e)}
        onChangeValue={e => this.changeValue(row, e)}
        onRemove={e => this.remove(row, e)}
        onAdd={e => this.add(row, e)}
      />
    )))
  }

  render () {
    const { scoring } = this.props
    return (
      <div>
        <FillingScoring scoring={scoring} onChange={this.fillScoring} />
        {this.renderFilledScoring()}
      </div>
    )
  }
}

export default Scoring
