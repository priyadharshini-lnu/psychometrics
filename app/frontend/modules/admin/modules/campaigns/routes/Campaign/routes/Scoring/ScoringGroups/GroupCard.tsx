import React, {
  CSSProperties, RefObject, LegacyRef, FC,
} from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Card, Space, Button, Typography,
} from 'antd'
import {
  DragOutlined, PlusOutlined, DeleteOutlined, EditOutlined,
} from '@ant-design/icons'
import { DraggableSyntheticListeners } from '@dnd-kit/core'
import { GroupForm } from './AddGroupForm'

export type CampaignFactorGroup = {
  id: string
  name: string
  position: number
}

type Props = {
  group: CampaignFactorGroup
  removeGroup: (groupId: string) => void
  addFactor: (groupId: string) => Promise<void> | void
  hasFactors: boolean
  onGroupNameChange?: (value: string, group: CampaignFactorGroup) => void
  sortId?: string
  dragStyle?: CSSProperties
  attributes?: React.HTMLAttributes<HTMLElement>
  listeners?: DraggableSyntheticListeners
  ref: LegacyRef<HTMLDivElement>
  style?: CSSProperties
  children?: React.ReactNode
  groupsCount: number
}

const { I18n } = window

export const GroupCard = React.forwardRef(
  (
    {
      group, attributes, listeners, dragStyle, style, removeGroup, children, hasFactors, addFactor, onGroupNameChange,
      groupsCount,
    }: Props, ref:RefObject<HTMLDivElement>,
  ) => {
    const [editName, setEditName] = React.useState(false)
    const handleFormFinish = (data: { name: string }) => {
      const { name } = data
      if (name !== group.name) {
        onGroupNameChange?.(name, group)
      }
      setEditName(false)
    }
    const handleBlur = (form) => {
      form.submit()
    }

    const titleElement = (
      <Space className="w-100 justify-between">
        <Space>
          <DragOutlined {...attributes} {...listeners} />
          {editName ? (
            <GroupForm
              initialValues={{ name: group.name }}
              onBlur={handleBlur}
              onFormFinish={handleFormFinish}
              noStyle
              nameLabel=""
            />
          ) : (
            <>
              <Typography.Text
                title={group.name}
                ellipsis
              >
                {group.name}
              </Typography.Text>
              <EditOutlined onClick={() => setEditName(true)} />
            </>
          )}
        </Space>
        {!hasFactors
        && groupsCount > 1
        && !editName && <DeleteOutlined className="items-end" onClick={() => removeGroup(group.id)} />}
      </Space>
    )
    return (
      <div ref={ref} style={{ ...style, ...dragStyle }}>
        <Card bodyStyle={{ background: '#f2f2f2', minWidth: '300px', padding: '12px' }} title={titleElement}>
          <Space className="w-100" direction="vertical">
            {children}
            <Button
              className="ps-3 pe-3"
              icon={<PlusOutlined />}
              onClick={() => addFactor(group.id)}
              type="link"
              ghost
            >
              {I18n.t('administration.scoring.add_factor')}
            </Button>
          </Space>
        </Card>
      </div>
    )
  },
)


type GroupCardSortableProps = {
  sortId: string
  group: CampaignFactorGroup
  items: string[]
  hasFactors: boolean
  removeGroup: (groupId: string) => void
  addFactor: (groupId: string) => Promise<void> | void
  children?: React.ReactNode
  onGroupNameChange?: (value: string, group: CampaignFactorGroup) => void
  groupsCount: number
}

export const GroupCardSortable:FC<GroupCardSortableProps> = ({
  group, children, sortId, items, removeGroup, hasFactors, addFactor, onGroupNameChange, groupsCount,
}) => {
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
      removeGroup={removeGroup}
      hasFactors={hasFactors}
      addFactor={addFactor}
      onGroupNameChange={onGroupNameChange}
      groupsCount={groupsCount}
    >
      {children}
    </GroupCard>
  )
}
