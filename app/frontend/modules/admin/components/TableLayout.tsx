import React, { FC } from 'react'
import {
  Row, Col, Button, Empty,
} from 'antd'
import { ReloadOutlined, IssuesCloseOutlined } from '@ant-design/icons'
import { CountDisplay } from '~/components/CountDisplay'

type Props = {
  recordCount?: number
  loading: boolean
  disableHeader?: boolean
  requestStatus: string | undefined
  filters?: React.ReactChild
  table: React.ReactChild
  failureMsg?: string
}

const { I18n } = window

export const TableLayout: FC<Props> = ({
  recordCount, loading, filters, table, requestStatus, disableHeader, failureMsg,
}) => {
  const requestFailed = requestStatus === 'failed'

  return (
    <>
      {!disableHeader && (
      <Row
        justify="space-between"
        align="middle"
        className="pt-4 pb-4 ps-4 pe-4"
      >
        <Col>
          <CountDisplay
            selectedCount={0}
            totalCount={requestFailed ? 0 : recordCount || 0}
            isLoading={loading}
          />
        </Col>
        <Col>
          {filters}
        </Col>
      </Row>
      )}
      <Row>
        <Col span={24}>
          {requestFailed ? <RequestFailedMessage failureMsg={failureMsg} /> : table}
        </Col>
      </Row>
    </>
  )
}

const RequestFailedMessage = ({ failureMsg }) => (
  <div className="p-12">
    <Empty
      image={<IssuesCloseOutlined style={{ fontSize: 80 }} />}
      description={(
        <h3>
          {failureMsg || I18n.t('frontend.request_failed_message_box.message')}
        </h3>
      )}
    >
      <Button type="primary" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
        {I18n.t('frontend.request_failed_message_box.refresh')}
      </Button>
    </Empty>
  </div>
)
