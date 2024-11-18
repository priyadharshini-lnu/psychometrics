import { Component } from 'react'
import _ from 'lodash'
import cs from 'classnames'
import Utils from '~/modules/reports/utils/Utils'
import ScoreRange from './ScoreRange'
import styles from './styles.less'
import { ColorPicker } from '~/glint'

export default class ScoreRangeList extends Component {
  addScoreRange = () => {
    const { modules } = this.props
    const model = modules[0]
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
    const { modules } = this.props
    modules.forEach((model) => {
      model.props.scoreRanges = model.props.scoreRanges.filter(m => m.id !== id)
      model.update()
    })
  }

  updateScoreRange = (id, attrs) => {
    const { modules } = this.props
    modules.forEach((model) => {
      model.props.scoreRanges = model.props.scoreRanges.map((m) => {
        if (m.id !== id) {
          return m
        }
        return { ...m, ...attrs }
      }).sort((a, b) => a.value - b.value)
      model.update()
    })
  }

  changeLineColor = (color) => {
    const { modules } = this.props
    modules.forEach((model) => {
      model.props.scoreLineColor = color
      model.update()
    })
  }

  changeBulletColor = (color) => {
    const { modules } = this.props
    modules.forEach((model) => {
      model.props.scoreBulletColor = color
      model.update()
    })
  }


  update = () => {
    const { modules } = this.props
    modules.forEach((model) => {
      model.update()
    })
  }


  render () {
    const { modules } = this.props
    const model = modules[0]
    const { props: { scoreRanges = [], scoreLineColor, scoreBulletColor } } = model

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
