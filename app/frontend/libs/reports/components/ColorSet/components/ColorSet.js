import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DropTarget } from 'react-dnd'
import update from 'react-addons-update'
import _ from 'lodash'
import styles from './ColorSet.scss'
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

  moveSwatch = (id, atIndex) => {
    const { colors } = this.state
    const { model } = this.props
    const { color, index } = this.findSwatch(id)
    this.setState(update(model.props, {
      colors: {
        $splice: [
          [index, 1],
          [atIndex, 0, color],
        ],
      },
    }))
    model.props.colors = colors
    this.forceUpdate()
  }

  remove = (id) => {
    const { model } = this.props
    const { index } = this.findSwatch(id)
    this.setState(update(model.props, {
      colors: {
        $splice: [
          [index, 1],
        ],
      },
    }))
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
