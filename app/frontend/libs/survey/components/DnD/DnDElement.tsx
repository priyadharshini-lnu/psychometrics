import React from 'react'
import {
  DragSource, DropTarget, DragSourceMonitor, ConnectDragPreview, ConnectDragSource, ConnectDropTarget,
  DropTargetMonitor,
} from 'react-dnd'
import cs from 'classnames'
import styles from './DnDStyle.scss'

interface DndElementProps {
  children: React.ReactNode
  index: number
  onEndDrag?: () => void
  rowList: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  onDrag: (list: any[]) => void // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface DragProps {
  // TODO (atanych): All DragProps are optional to prevent ts errors when render this component
  isDragging?: DragSourceMonitor
  connectDragSource?: ConnectDragSource
  connectDragPreview?: ConnectDragPreview
  connectDropTarget?: ConnectDropTarget
}

type Props = DndElementProps & DragProps

const DndElement: React.FC<Props> = ({
  children, isDragging = false, connectDragSource, connectDragPreview, connectDropTarget,
}) => {
  const opacity = isDragging ? 0.25 : 1

  // TODO (atanych): This condition need to resolve ts warnings due to DragProps are optional
  if (!connectDragSource || !connectDragPreview || !connectDropTarget) return <div />

  return connectDragPreview(connectDropTarget(
    <div className={styles.rowContainer} style={{ opacity }}>
      {connectDragSource(<i className={cs('fa fa-bars', styles.draggingIcon)} />)}
      {children}
    </div>,
  ))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const moveRow = (dragPosition: number, hoverPosition: number, { rowList, onDrag }: Props): void => {
  const filteredRowList = rowList.filter((_o, i) => i !== dragPosition)

  onDrag([
    ...(filteredRowList.slice(0, hoverPosition)),
    rowList[dragPosition],
    ...(filteredRowList.slice(hoverPosition)),
  ])
}

const optionTarget = {
  hover (props: Props, monitor: DropTargetMonitor): void {
    const dragPosition = monitor.getItem().index
    const hoverPosition = props.index

    if (dragPosition === hoverPosition) return

    monitor.getItem().index = hoverPosition

    moveRow(dragPosition, hoverPosition, props)
  },
}

const optionSource = {
  beginDrag ({ index }: Props): object {
    return { index }
  },
  isDragging (props: Props, monitor: DragSourceMonitor): boolean {
    return monitor.getItem().index === props.index
  },
  endDrag ({ onEndDrag }: Props): void {
    onEndDrag && onEndDrag()
  },
}

export default DropTarget('message', optionTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(
  DragSource<DndElementProps>('message', optionSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  }))(DndElement),
)
