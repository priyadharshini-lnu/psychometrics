import { Component } from 'react'
import PropTypes from 'prop-types'
import { DropTarget } from 'react-dnd'

import _ from 'lodash'
import { updateIn } from '~/utils/immutable'
import styles from './ColorSet.less'
import Swatch from './Swatch'
import Trash from './Trash'

const fieldTarget = {
  drop () {
  },
}

// eslint-disable-next-line import/no-mutable-exports
let ColorSet = class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    connectDropTarget: PropTypes.func,
  }

  constructor (props) {
    super(props)
    this.state = {
      colors: props.model.props.colors,
    }
  }

  componentDidUpdate () {
    const { colors } = this.state
    const { model } = this.props
    model.props.colors = colors
  }

  findSwatch = (id) => {
    const { model: { props: { colors } } } = this.props
    const color = _.find(colors, { id })

    return {
      color,
      index: colors.indexOf(color),
    }
  }

  moveSwatch = (id, newId) => {
    const { model: { props: { colors } }, model } = this.props
    const { color } = this.findSwatch(id)
    const { color: newColor } = this.findSwatch(newId)
    const newColors = colors.map((c) => {
      if (c.id === id) { return newColor }
      if (c.id === newId) { return color }
      return c
    })
    model.props.colors = newColors
    this.setState({ colors: newColors })
  }

  remove = (id) => {
    const { model } = this.props
    const { index } = this.findSwatch(id)
    const updatedColors = updateIn(
      model.props,
      ['colors'],
      colors => [...colors.slice(0, index), ...colors.slice(index + 1),
      ],
    )
    this.setState(updatedColors)
    this.update()
  }

  add = () => {
    const { model } = this.props
    const max = _.maxBy(model.props.colors, 'id') || { id: 0 }
    model.props.colors.push({ id: max.id + 1, color: '#000' })
    this.update()
  }

  update = () => {
    const { model } = this.props
    const { colors } = this.state
    model.props.colors = colors
    model.update(colors)
    this.forceUpdate()
  }

  render () {
    const { model, connectDropTarget } = this.props
    const { colors } = model.props

    return connectDropTarget(
      <div className={styles.colorSet}>
        <div className={styles.field}>
          {colors.map(color => (
            <Swatch
              color={color}
              key={color.id}
              id={color.id}
              moveSwatch={this.moveSwatch}
              findSwatch={this.findSwatch}
              remove={this.remove}
              onChange={this.update}
            />
          ))}
        </div>
        <div className={styles.controls}>
          <div><span className="fa fa-plus" onClick={this.add} /></div>
          <div><Trash /></div>
        </div>
      </div>,
    )
  }
}

ColorSet = DropTarget('Color', fieldTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(ColorSet)

export default ColorSet
