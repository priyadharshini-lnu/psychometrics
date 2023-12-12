import React, {
  CSSProperties, RefObject, LegacyRef, FC,
} from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, Space } from 'antd'
import { DragOutlined } from '@ant-design/icons'
import { DraggableSyntheticListeners } from '@dnd-kit/core'

export type CampaignFactorGroup = {
  id: number
  name: string
  position: number
}

type Props = {
  group: CampaignFactorGroup
  sortId?: string
  dragStyle?: CSSProperties
  attributes?: React.HTMLAttributes<HTMLElement>
  listeners?: DraggableSyntheticListeners
  ref: LegacyRef<HTMLDivElement>
  style?: CSSProperties
}
export const GroupCard = React.forwardRef(
  (
    {
      group, attributes, listeners, dragStyle, style,
    }: Props, ref:RefObject<HTMLDivElement>,
  ) => {
    const titleElement = (
      <Space className="w-100 justify-between">
        <span>{group.name}</span>
        <div>
          <DragOutlined {...attributes} {...listeners} />
        </div>
      </Space>
    )
    return (
      <div ref={ref} style={{ ...style, ...dragStyle }}>
        <Card bodyStyle={{ background: 'lightgrey', minWidth: '300px', padding: '12px' }} title={titleElement}>
          {/* <Space className="w-100" direction="vertical">
            {
              factors.map(factor => <Factor key={factor.id} factor={factor} />)
            }
            <Button className="ps-0 pe-0" icon={<PlusOutlined />} type="link" ghost>Add factor</Button>
          </Space> */}
        </Card>
      </div>
    )
  },
)


type GroupCardSortableProps = {
  sortId: string
  group: CampaignFactorGroup
  items: string[]
}

export const GroupCardSortable:FC<GroupCardSortableProps> = ({ group, sortId, items }) => {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({
    id: sortId,
    data: {
      type: 'container',
      children: items,
    },
  })

  const dragStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  } as CSSProperties

  const containerStyle: CSSProperties = { opacity: isDragging ? '0.5' : undefined }

  return (
    <GroupCard
      group={group}
      ref={setNodeRef}
      attributes={attributes}
      listeners={listeners}
      dragStyle={dragStyle}
      style={containerStyle}
    />
  )
}

// export const Factor = ({ factor }) => (
//   <Space className="w-100" style={{ background: 'white', padding: '12px' }}>
//     <MenuOutlined />
//     {factor.name}
//   </Space>
// )
