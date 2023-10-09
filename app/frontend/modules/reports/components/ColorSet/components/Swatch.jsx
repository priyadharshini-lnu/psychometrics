import { Component } from 'react'
import PropTypes from 'prop-types'
import { DragSource, DropTarget } from 'react-dnd'
import { ColorPicker } from '~/glint'
import styles from './ColorSet.less'

const swatchSource = {
  beginDrag (props) {
    return {
      id: props.id,
      originalIndex: props.findSwatch(props.id).index,
    }
  },

  endDrag (props, monitor) {
    const { id: droppedId } = monitor.getItem()
    const didDrop = monitor.didDrop()
    const dropResult = monitor.getDropResult()
    props.onChange()

    if (dropResult && dropResult.name === 'Trash') {
      props.remove(droppedId)
      return
    }
    if (!didDrop) {
      props.moveSwatch(droppedId, droppedId)
    }
  },
}

const swatchTarget = {
  canDrop () {
    return false
  },

  hover (props, monitor) {
    const { id: draggedId } = monitor.getItem()
    const { id: overId } = props

    if (draggedId !== overId) {
      props.moveSwatch(draggedId, overId)
    }
  },
}

// eslint-disable-next-line import/no-mutable-exports
let Swatch = class extends Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    color: PropTypes.object.isRequired,
  }

  change = (val) => {
    const { color, onChange } = this.props
    color.color = val
    this.forceUpdate()
    onChange && onChange()
  }

  render () {
    const { isDragging, connectDragSource, connectDropTarget } = this.props
    const opacity = isDragging ? 0 : 1

    const { color } = this.props

    return connectDragSource(connectDropTarget(
      <div className={styles.swatch} style={{ opacity }}>
        <ColorPicker getValueInHexFormat value={color.color} onChange={this.change} />
      </div>,
    ))
  }
}

Swatch = DropTarget('Color', swatchTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(Swatch)

Swatch = DragSource('Color', swatchSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))(Swatch)

export default Swatch
