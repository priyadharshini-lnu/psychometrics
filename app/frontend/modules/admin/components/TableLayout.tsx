import React, { FC } from 'react'
import { CountDisplay } from 'components/CountDisplay'
import { Row, Col } from 'antd'

type Props = {
  recordCount?: number
  loading: boolean
  filters?: React.ReactChild
  table: React.ReactChild
}

export const TableLayout: FC<Props> = ({
  recordCount, loading, filters, table,
}) => (
  <>
    <Row
      justify="space-between"
      align="middle"
      className="pt-4 pb-4 ps-4 pe-4"
    >
      <Col>
        <CountDisplay
          selectedCount={0}
          totalCount={recordCount || 0}
          isLoading={loading}
        />
      </Col>
      <Col>
        {filters}
      </Col>
    </Row>
    <Row>
      <Col span={24}>
        {table}
      </Col>
    </Row>
  </>
)
