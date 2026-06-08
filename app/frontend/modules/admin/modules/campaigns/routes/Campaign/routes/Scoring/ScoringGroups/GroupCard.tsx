import React, {
  CSSProperties, RefObject, LegacyRef, FC,
} from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Card, Space, Button, Typography, App,
} from 'antd'
import { DraggableSyntheticListeners } from '@dnd-kit/core'
import {
  DragOutlined, PlusOutlined, DeleteOutlined, EditOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { GroupForm } from './AddGroupForm'

export const FACTORS_LIMIT = 300

export type CampaignFactorGroup = {
  id: string
  name: string
  position: number
}

type Permissions = {
  manageCampaignScoring: boolean
}

type Props = {
  group: CampaignFactorGroup
  removeGroup: (group: CampaignFactorGroup) => void
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
  permissions: Permissions
  totalFactors: number
}

const { I18n } = window

export const GroupCard = React.forwardRef(
  (
    {
      group, attributes, listeners, dragStyle, style, removeGroup, children, hasFactors, addFactor, onGroupNameChange,
      groupsCount, permissions, totalFactors,
    }: Props, ref:RefObject<HTMLDivElement>,
  ) => {
    const [editName, setEditName] = React.useState(false)
    const { modal } = App.useApp()
    const handleFormFinish = () => {
      setEditName(false)
    }
    const handleBlur = (form) => {
      form.submit()
    }

    const handleAddFactor = () => {
      if (totalFactors < FACTORS_LIMIT) {
        addFactor(group.id)
      } else {
        modal.error({
          title: I18n.t('admin.scoring_action_prohibited'),
          content: <p className="">{I18n.t('admin.scoring_desc', { n: FACTORS_LIMIT })}</p>,
          footer: (_, { OkBtn }) => (
            <OkBtn />
          ),
        })
      }
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
              group={group}
              editGroup={onGroupNameChange}
            />
          ) : (
            <>
              <Typography.Text
                title={group.name}
                ellipsis
              >
                {group.name}
              </Typography.Text>
              {permissions.manageCampaignScoring ? <EditOutlined onClick={() => setEditName(true)} /> : null}
            </>
          )}
        </Space>
        {!hasFactors
        && groupsCount > 1
        && !editName && <DeleteOutlined className="items-end" onClick={() => removeGroup(group)} />}
      </Space>
    )
    return (
      <div ref={ref} style={{ ...style, ...dragStyle }}>
        <Card styles={{ body: { background: '#f2f2f2', minWidth: '300px', padding: '12px' } }} title={titleElement}>
          <Space className="w-100" orientation="vertical">
            {children}
            {permissions.manageCampaignScoring ? (
              <Button
                className="ps-3 pe-3"
                icon={<PlusOutlined />}
                onClick={handleAddFactor}
                type="link"
              >
                {I18n.t('admin.scoring_add_factor')}
              </Button>
            ) : null}
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
  removeGroup: (group: CampaignFactorGroup) => void
  addFactor: (groupId: string) => Promise<void> | void
  children?: React.ReactNode
  onGroupNameChange?: (value: string, group: CampaignFactorGroup) => void
  groupsCount: number
  permissions: Permissions
  totalFactors: number
}

export const GroupCardSortable:FC<GroupCardSortableProps> = ({
  group, children, sortId, items, removeGroup, hasFactors, addFactor, onGroupNameChange,
  groupsCount, permissions, totalFactors,
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
      permissions={permissions}
      totalFactors={totalFactors}
    >
      {children}
    </GroupCard>
  )
}
