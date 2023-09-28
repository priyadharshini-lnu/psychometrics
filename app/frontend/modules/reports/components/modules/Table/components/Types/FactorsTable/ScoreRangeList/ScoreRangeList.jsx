import { Component } from 'react'
import _ from 'lodash'
import cs from 'classnames'
import Utils from '~/modules/reports/utils/Utils'
import ScoreRange from './ScoreRange'
import styles from './styles.less'

export default class ScoreRangeList extends Component {
  addScoreRange = () => {
    const { model } = this.props
    const maxValue = _.maxBy(model.props.scoreRanges || [], x => x.value)
    model.props.scoreRanges = [
      ...(model.props.scoreRanges || []),
      {
        value: (maxValue?.value || -1) + 1,
        id: Utils.genId(),
        color: {
          r: 155, g: 155, b: 155, a: 1,
        },
      },
    ]
    this.update()
  }

  removeScoreRange = ({ id }) => {
    const { model } = this.props
    model.props.scoreRanges = model.props.scoreRanges.filter(m => m.id !== id)
    this.update()
  }

  updateScoreRange = (id, attrs) => {
    const { model } = this.props
    model.props.scoreRanges = model.props.scoreRanges.map((m) => {
      if (m.id !== id) {
        return m
      }
      return { ...m, ...attrs }
    }).sort((a, b) => a.value - b.value)
    this.update()
  }

  update = () => {
    const { model } = this.props
    model.update()
    this.forceUpdate()
  }

  render () {
    const { model: { props: { scoreRanges = [] } } } = this.props

    return (
      <div className="mts">
        <div>
          <span>Score Ranges</span>
          <i className={cs('fa', 'fa-plus', 'mls', styles.add)} onClick={this.addScoreRange} />
        </div>
        <div>
          {scoreRanges.map((scoreRange, i) => (
            <ScoreRange
              onUpdate={this.updateScoreRange}
              onRemove={this.removeScoreRange}
              key={scoreRange.id}
              scoreRange={scoreRange}
              showColorPicker={i < scoreRanges.length - 1}
            />
          ))}
        </div>
      </div>
    )
  }
}
