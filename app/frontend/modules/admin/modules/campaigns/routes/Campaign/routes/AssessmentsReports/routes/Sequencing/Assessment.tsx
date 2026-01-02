import React, { CSSProperties, Ref } from 'react'
import {
  Button, Card, Space, Typography, Col, Row,
} from 'antd'
import { DraggableSyntheticListeners } from '@dnd-kit/core'
import { MenuOutlined, EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
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
  onEditScheduleTime?: () => void
}

export const Assessment = React.forwardRef<HTMLDivElement, Props>(
  ({
    assessment, attributes, listeners, dragStyles, span, style, onEditScheduleTime,
  }, ref: Ref<HTMLDivElement>) => (
    <Col span={span} style={{ ...dragStyles, ...style }} ref={ref}>
      <Card className="h-100" size="small">
        <Row wrap={false} gutter={[10, 0]} className="w-100">
          <Space>
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
          {assessment?.workshopActivityDuration && onEditScheduleTime && (
            <Col className="ta-e text-nowrap" flex="auto">
              {`${assessment.workshopActivityDuration}m`}
              <Button
                onClick={onEditScheduleTime}
                className="ta-e"
                size="small"
                type="link"
                icon={<EditOutlined />}
              />
            </Col>
          )}
        </Row>
      </Card>
    </Col>
  ),
)
