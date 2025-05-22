import React, { CSSProperties, Ref } from 'react'
import {
  Button, Card, Space, Typography, Col,
} from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { DraggableSyntheticListeners } from '@dnd-kit/core'
import { ButtonColorType } from '~/interfaces/Antd'

import { CampaignAssessment } from '~/modules/admin/modules/campaigns/core/assessmentGroups'

type ButtonAttributes = {
  color?: ButtonColorType,
} & Omit<React.HTMLAttributes<HTMLElement>, 'color'>
interface Props {
  assessment?: CampaignAssessment
  dragStyles?: CSSProperties
  attributes?: ButtonAttributes
  listeners?: DraggableSyntheticListeners
  style?: CSSProperties
  span?: number
}

export const Assessment = React.forwardRef<HTMLDivElement, Props>(
  ({
    assessment, attributes, listeners, dragStyles, span, style,
  }, ref: Ref<HTMLDivElement>) => (
    <Col span={span} style={{ ...dragStyles, ...style }} ref={ref}>
      <Card className="h-100" size="small">
        <Space align="start">
          <Button
            icon={<MenuOutlined />}
            size="small"
            type="text"
            className="cursor-grab"
            {...attributes}
            {...listeners}
          />
          <Typography.Text>{assessment?.name}</Typography.Text>
        </Space>
      </Card>
    </Col>
  ),
)
