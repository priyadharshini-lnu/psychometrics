import React, { FC } from 'react'
import {
  Col, Card, Result, Row,
} from 'antd'
import { BlockOutlined } from '@ant-design/icons'
import { SortableContext, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable'

const { I18n } = window

interface Props {
  isLoading: boolean
  count: number
  children: React.ReactNode
  sortId: string
  items: string[]
}

export const UngroupedAssessmentContainer: FC<Props> = ({
  isLoading, count, children, sortId, items,
}) => {
  const { setNodeRef } = useSortable({
    id: sortId,
    data: {
      type: 'container',
      children: items,
    },
  })

  return (
    <Col span={24}>
      <div ref={setNodeRef}>
        <Card
          title={I18n.t('assessments_reports.sequencing.ungrouped_assessments')}
          loading={isLoading}
          size="small"
          styles={{ body: { backgroundColor: '#f0f0f0' } }}
        >
          <SortableContext items={items} strategy={horizontalListSortingStrategy} id="ungrouped">
            {count !== 0 ? (
              <>
                <Row gutter={[8, 8]}>{children}</Row>
              </>
            ) : (
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Result
                    icon={<BlockOutlined />}
                    subTitle={I18n.t('assessments_reports.sequencing.no_ungrouped_assessments')}
                  />

                </Col>
              </Row>
            )}
          </SortableContext>
        </Card>
      </div>
    </Col>
  )
}
