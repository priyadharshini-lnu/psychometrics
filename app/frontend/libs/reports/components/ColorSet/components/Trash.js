import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DropTarget } from 'react-dnd'

const trashTarget = {
  drop () {
    return { name: 'Trash' }
  },
}

// eslint-disable-next-line import/no-mutable-exports
let Trash = class extends Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
  }

  render () {
    const { isOver, connectDropTarget } = this.props
    const color = isOver ? '#FF0000' : ''

    return connectDropTarget(<span className="fa fa-trash" style={{ backgroundColor: color }} />)
  }
}

Trash = DropTarget('Color', trashTarget, (connect, monitor) => ({
  isOver: monitor.isOver(),
  connectDropTarget: connect.dropTarget(),
}))(Trash)

export default Trash
