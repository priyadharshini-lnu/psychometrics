import React, { useRef, useCallback } from 'react'
import { useDrop, useDrag, DragSourceMonitor } from 'react-dnd'
import cs from 'classnames'
import styles from './DnDStyle.scss'
import ItemTypes from './ItemTypes'

interface Props {
  children: React.ReactNode
  index: number
  onEndDrag?: () => void
  rowList: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  onDrag: (list: any[]) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  wrapper?: React.ComponentType
}

interface DragItem {
  index: number
  type: string
}

const DndElement: React.FC<Props> = ({
  children, rowList, onDrag, index, onEndDrag, wrapper, ...props
}) => {
  const elementRef = useRef<HTMLDivElement>(null)

  const moveRow = useCallback((dragPosition: number, hoverPosition: number): void => {
    const filteredRowList = rowList.filter((_o, i) => i !== dragPosition)

    onDrag([
      ...(filteredRowList.slice(0, hoverPosition)),
      rowList[dragPosition],
      ...(filteredRowList.slice(hoverPosition)),
    ])
  }, [rowList])

  const [, drop] = useDrop({
    accept: ItemTypes.ELEMENT,
    hover (item: DragItem) {
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) return

      moveRow(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
    drop () {
      onEndDrag && onEndDrag()
    },
  })

  const [{ isDragging }, source, drag] = useDrag({
    item: { type: ItemTypes.ELEMENT, index },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0.25 : 1
  drag(drop(elementRef))

  const WrapperComponent = wrapper || 'div'

  return (
    <WrapperComponent {...props}>
      <div ref={elementRef} className={styles.rowContainer} style={{ opacity }}>
        <i ref={source} className={cs('fa fa-bars', styles.draggingIcon)} />
        {children}
      </div>
    </WrapperComponent>
  )
}

export default DndElement
