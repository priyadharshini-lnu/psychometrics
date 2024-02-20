import React, {
  FC, CSSProperties, LegacyRef, RefObject,
} from 'react'
import { Space, Row, Col } from 'antd'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DraggableSyntheticListeners } from '@dnd-kit/core'
import { MenuOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

export type CampaignFactor = {
  position: number,
  name: string,
  id: string,
  code: string,
  campaignFactorGroupId: number,
  dimensionId?: string,
  assessmentId?: string,
  factorId?: string,
}

type Props = {
  factor: CampaignFactor
  dragStyle?: CSSProperties
  attributes?: React.HTMLAttributes<HTMLElement>
  listeners?: DraggableSyntheticListeners
  ref: LegacyRef<HTMLDivElement>
  style?: CSSProperties
  removeFactor: (factor: CampaignFactor) => void
  onEditFactor: (factor: CampaignFactor) => Promise<void> | void
}

export const Factor = React.forwardRef(
  ({
    factor, attributes, listeners, dragStyle, style, removeFactor, onEditFactor,
  }: Props, ref:RefObject<HTMLDivElement>) => {
    const handleDeleteFactor = () => {
      removeFactor(factor)
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
                <EditOutlined onClick={() => onEditFactor(factor)} />
                <DeleteOutlined onClick={handleDeleteFactor} />
              </Space>
            </Col>
          </Row>
        </div>
      </>
    )
  },
)

type FactorSortableProps = {
  sortId: string
  factor: CampaignFactor
  removeFactor: (factor: CampaignFactor) => void
  onEditFactor: (factor: CampaignFactor) => Promise<void> | void
}

export const FactorSortable:FC<FactorSortableProps> = ({
  factor, sortId, removeFactor, onEditFactor,
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
      onEditFactor={onEditFactor}
    />
  )
}
