import React, { useRef, useCallback, useEffect } from 'react'
import _ from 'lodash'
import { useDrop, useDrag, DragSourceMonitor } from 'react-dnd'
import { MenuOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './DnDStyle.less'
import ItemTypes from './ItemTypes'

interface Props {
  children: React.ReactNode
  element: any // eslint-disable-line @typescript-eslint/no-explicit-any
  uniqField: string
  iconWrapper?: React.ComponentType
  onEndDrag?: () => void
  iconClass?: string
  // Unfortunately, I can not handle DnD without additional wrapper, when main wrapper can not accept ref
  additionalWrapper?: boolean
  strategy: 'index' | 'position'
  list: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  onDrag: (list: any, a?: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  wrapper?: React.ComponentType
}

interface DragItem {
  id: number | string
  type: string
}

const CACHED_LIST = {}
const INDEX_BY_ID = {}

interface MoveItem {
  index: number
  id: number | string
}

interface Strategy {
  collectList:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (list: any[], uniqField: string | undefined, dragItem: MoveItem, hoverItem: MoveItem) => any[] | undefined
}

interface Strategies {
  position: Strategy,
  index: Strategy
}

const STRATEGIES: Strategies = {
  position: {
    collectList: (list, uniqField, { id: dragId }, { id: hoverId }) => {
      if (!uniqField) return

      const newList = list.map((r) => {
        if (r[uniqField] === dragId) { return { ...r, position: CACHED_LIST[hoverId].position } }
        if (r[uniqField] === hoverId) { return { ...r, position: CACHED_LIST[dragId].position } }
        return r
      })
      return _.sortBy(newList, 'position').map((r, i) => ({ ...r, position: i + 1 }))
    },
  },
  index: {
    collectList: (list, _idName, { index: dragIndex }, { index: hoverIndex }) => list.map((c, i) => {
      if (i === dragIndex) return list[hoverIndex]
      if (i === hoverIndex) return list[dragIndex]
      return c
    }),
  },
}

const DnDElement: React.FC<Props> = ({
  iconWrapper,
  children,
  iconClass,
  list,
  onDrag, uniqField,
  onEndDrag,
  strategy,
  additionalWrapper,
  wrapper,
  element,
  ...props
}) => {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!uniqField) return

    list.forEach((r, i) => {
      CACHED_LIST[r[uniqField]] = r
      INDEX_BY_ID[r[uniqField]] = i
    })
  }, [list])

  const moveRow = useCallback((dragItem: MoveItem, hoverItem: MoveItem): void => {
    const newList = STRATEGIES[strategy].collectList(list, uniqField, dragItem, hoverItem)
    onDrag(newList)
  }, [list])

  const [, drop] = useDrop({
    accept: ItemTypes.ELEMENT,
    hover (item: DragItem, monitor) {
      if (!elementRef.current) {
        return
      }

      const dragId = item.id
      const hoverId = element[uniqField]

      if (dragId === hoverId) return

      // Determine rectangle on screen
      const hoverBoundingRect = elementRef.current.getBoundingClientRect()
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      if (!clientOffset) { return }
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      const dragIndex = INDEX_BY_ID[dragId]
      const hoverIndex = INDEX_BY_ID[hoverId]

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      moveRow({ id: dragId, index: dragIndex }, { id: hoverId, index: hoverIndex })
    },
    drop () {
      onEndDrag && onEndDrag()
    },
  })

  const [{ isDragging }, source, drag] = useDrag({
    item: { type: ItemTypes.ELEMENT, id: element[uniqField] },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0.25 : 1
  drag(drop(elementRef))

  const WrapperComponent = wrapper || 'div'
  const IconWrapper = iconWrapper || 'div'

  const renderChildren = () => (
    <>
      <IconWrapper ref={source} className={iconClass}>
        <MenuOutlined className={styles.draggingIcon} />
      </IconWrapper>
      {children}
    </>
  )

  return (
    <WrapperComponent {...props} style={{ opacity }} ref={additionalWrapper ? null : elementRef}>
      {additionalWrapper
        ? <div ref={elementRef} className={styles.divContainer}>{renderChildren()}</div>
        : renderChildren()}
    </WrapperComponent>
  )
}

export default DnDElement
