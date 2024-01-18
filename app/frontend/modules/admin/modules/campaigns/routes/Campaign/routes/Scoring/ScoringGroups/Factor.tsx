import React, {
  FC, CSSProperties, LegacyRef, RefObject,
} from 'react'
import { Space, Row, Col } from 'antd'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DraggableSyntheticListeners } from '@dnd-kit/core'
import { MenuOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

import { AddEditFactorForm } from './AddEditFactorForm'

export type CampaignFactor = {
  position: number,
  name: string,
  id: string,
  code: string,
  campaignFactorGroupId: number,
}

type Props = {
  factor: CampaignFactor
  dragStyle?: CSSProperties
  attributes?: React.HTMLAttributes<HTMLElement>
  listeners?: DraggableSyntheticListeners
  ref: LegacyRef<HTMLDivElement>
  style?: CSSProperties
  removeFactor: (factorId: string) => void
  editFactor: (newData, factor: CampaignFactor) => Promise<void> | void
}

export const Factor = React.forwardRef(
  ({
    factor, attributes, listeners, dragStyle, style, removeFactor, editFactor,
  }: Props, ref:RefObject<HTMLDivElement>) => {
    const [openEditFactor, setOpenEditFactor] = React.useState(false)

    const handleEditFactor = (newData: CampaignFactor|{}) => {
      editFactor(newData, factor)
    }

    const handleDeleteFactor = () => {
      removeFactor(factor.id)
    }

    return (
      <>
        <div ref={ref} style={{ ...style, ...dragStyle }}>
          <Row style={{ background: 'white', padding: '12px' }}>
            <Col span={18}>
              <Space className="w-100">
                <MenuOutlined {...attributes} {...listeners} />
                {factor.name}
              </Space>
            </Col>
            <Col span={6}>
              <Space className="w-100 justify-end">
                <EditOutlined onClick={() => setOpenEditFactor(true)} />
                <DeleteOutlined onClick={handleDeleteFactor} />
              </Space>
            </Col>
          </Row>
        </div>
        <AddEditFactorForm
          open={openEditFactor}
          onClose={() => setOpenEditFactor(false)}
          editFactor={handleEditFactor}
          factorData={factor}
        />
      </>
    )
  },
)

type FactorSortableProps = {
  sortId: string
  factor: CampaignFactor
  removeFactor: (factorId: string) => void
  editFactor: (newData, factor: CampaignFactor) => Promise<void> | void
}

export const FactorSortable:FC<FactorSortableProps> = ({
  factor, sortId, removeFactor, editFactor,
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
    <Factor
      factor={factor}
      ref={setNodeRef}
      attributes={attributes}
      listeners={listeners}
      dragStyle={dragStyle}
      style={containerStyle}
      removeFactor={removeFactor}
      editFactor={editFactor}
    />
  )
}
