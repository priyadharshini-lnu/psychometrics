/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DragLayer } from 'react-dnd'
import ReactDOM from 'react-dom'
import _ from 'lodash'
import styles from './DragAndDrop.scss'

function collect (monitor) {
  const item = monitor.getItem()
  return {
    id: item && item.id,
    number: item && item.number,
    text: item && item.text,
    currentOffset: monitor.getSourceClientOffset(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }
}

function getParentOffsets (node) {
  const parent = node.parentNode
  if (!parent) {
    return {
      x: 0,
      y: 0,
    }
  }
  const rect = parent.getBoundingClientRect()
  const nodeRect = node.getBoundingClientRect()
  return {
    x: Math.round(rect.left),
    y: Math.round(rect.top + rect.height - nodeRect.height),
  }
}

function getItemStyles (currentOffset, parentOffset, initialOffset) {
  if (!currentOffset) {
    return {
      display: 'none',
    }
  }
  const x = initialOffset.x - parentOffset.x
  const y = currentOffset.y - parentOffset.y
  const transform = `translate(${x}px, ${y}px)`
  return {
    pointerEvents: 'none',
    transform,
    opacity: 1,
  }
}

class ItemPreview extends Component {
  constructor (props) {
    super(props)
    this.state = {
      parentOffset: { x: 0, y: 0 },
    }
  }

  componentDidMount () {
    this.updateParentOffset()
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !(_.isEqual(this.props, nextProps) && _.isEqual(this.state, nextState))
  }

  componentDidUpdate () {
    this.updateParentOffset()
  }

  updateParentOffset () {
    const { parentOffset } = this.state
    const newOffset = getParentOffsets(ReactDOM.findDOMNode(this))
    if (!_.isEqual(parentOffset, newOffset)) {
      this.setState({ parentOffset: newOffset })
    }
  }

  render () {
    const {
      number, text, isDragging, currentOffset, initialOffset,
    } = this.props
    const { parentOffset } = this.state
    if (!isDragging) {
      return <div />
    }

    return (
      <div className={styles.item} style={getItemStyles(currentOffset, parentOffset, initialOffset)}>
        <span className={`fa fa-bars ${styles.icon}`} />
        <div className={styles.number}>{number}</div>
        <div className={styles.text}>{text}</div>
      </div>
    )
  }
}

ItemPreview.propTypes = {
  number: PropTypes.number,
  text: PropTypes.string,
  currentOffset: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  initialOffset: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  isDragging: PropTypes.bool,
}

export default DragLayer(collect)(ItemPreview)
