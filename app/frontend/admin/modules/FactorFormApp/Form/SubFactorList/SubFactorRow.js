import React from 'react'
import { DragSource, DropTarget } from 'react-dnd'

const SubFactorRow = ({
  isDragging, connectDragSource, connectDropTarget, connectDragPreview, scoringStrategy, ...restProps
}) => {
  const opacity = isDragging ? 0 : 1

  const [firstChild, ...children] = restProps.children

  return scoringStrategy === 'sub_factors_conditional_average' ? connectDragPreview(connectDropTarget(
    <tr {...restProps} style={{ opacity }}>
      {connectDragSource(<td style={{ cursor: 'move' }}>{firstChild.props.column.render()}</td>)}
      {children}
    </tr>,
  )) : <tr {...restProps} />
}

const rowTarget = {
  hover (props, monitor) {
    const dragPosition = monitor.getItem().position
    const hoverPosition = props.position

    if (dragPosition === hoverPosition) {
      return
    }

    props.moveRow(dragPosition, hoverPosition)

    monitor.getItem().position = hoverPosition
  },
}

const rowSource = {
  beginDrag ({ position }) {
    return {
      position,
    }
  },
}

export default DropTarget('row', rowTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(
  DragSource('row', rowSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  }))(SubFactorRow),
)
