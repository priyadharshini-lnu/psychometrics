import { Component } from 'react'
import _ from 'lodash'
import cs from 'classnames'
import Utils from '~/modules/reports/utils/Utils'
import ScoreRange from './ScoreRange'
import styles from './styles.less'
import { ColorPicker } from '~/glint'

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

  changeLineColor = (color) => {
    const { model } = this.props
    model.props.scoreLineColor = color
    this.update()
  }

  changeBulletColor = (color) => {
    const { model } = this.props
    model.props.scoreBulletColor = color
    this.update()
  }

  update = () => {
    const { model } = this.props
    model.update()
    this.forceUpdate()
  }

  render () {
    const { model: { props: { scoreRanges = [], scoreLineColor, scoreBulletColor } } } = this.props

    return (
      <div className="mts">
        <div className={styles.colors}>
          <div className={styles.colorRow}>
            <ColorPicker
              swatchClassName={styles.swatch}
              getValueInHexFormat
              value={scoreLineColor || '#000000'}
              onChange={this.changeLineColor}
            />
            <span>Line Color</span>
          </div>
          <div className={styles.colorRow}>
            <ColorPicker
              swatchClassName={styles.swatch}
              getValueInHexFormat
              value={scoreBulletColor || '#000000'}
              onChange={this.changeBulletColor}
            />
            <span>Bullet Color</span>
          </div>
        </div>
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
