import React, {
  FC, CSSProperties, RefObject,
} from 'react'
import { Button, Space } from 'antd'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DraggableSyntheticListeners } from '@dnd-kit/core'
import styles from './DragAndDrop.less'

import DescriptionPreview from '../../DescriptionPreview'

type CommonProps = {
  text: string,
  number: number,
  showDescription: boolean,
  description: string,
  id?: string
}

export type Props = CommonProps & {
  style: CSSProperties,
  dragStyle: CSSProperties,
  attributes: React.HTMLAttributes<HTMLElement>,
  listeners: DraggableSyntheticListeners,
}

export const DragItem = React.forwardRef(
  ({
    showDescription, text, number, description, style, dragStyle, attributes, listeners, id,
  }: Props, ref:RefObject<HTMLLIElement>) => (
    <li ref={ref} className={styles.item} style={{ ...style, ...dragStyle }}>
      <Button
        aria-labelledby={id}
        type="text"
        className={`fa fa-arrows-v ${styles.icon}`}
        {...attributes}
        {...listeners}
      />
      <Space id={id} size={0}>
        <div className={styles.number}>{number}</div>
        <div className={styles.text}>{text}</div>
        {showDescription && <DescriptionPreview description={description} />}
      </Space>
    </li>
  ),
)

type FactorSortableProps = CommonProps & {
  sortId: string
}

export const DragItemSortable:FC<FactorSortableProps> = ({
  text, sortId, number, showDescription, description, id,
}) => {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({
    id: sortId,
    data: {
      type: 'container',
    },
  })

  const dragStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  } as CSSProperties

  const containerStyle: CSSProperties = { opacity: isDragging ? '0.5' : undefined }

  return (
    <DragItem
      ref={setNodeRef}
      attributes={attributes}
      listeners={listeners}
      dragStyle={dragStyle}
      style={containerStyle}
      text={text}
      number={number}
      showDescription={showDescription}
      description={description}
      id={id}
    />
  )
}
