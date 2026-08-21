import React, { FC } from 'react'
import {
  Row, Col, Button, Empty,
  Checkbox,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { ReloadOutlined, IssuesCloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { CountDisplay } from '~/components/CountDisplay'
import { hasErrorsToHandle } from '~/components/ErrorModal/ErrorModal'
import { getRequestErrors } from '~/core/errors'

const connector = connect(state => ({
  ...getRequestErrors(state),
}))

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = {
  recordCount?: number
  loading: boolean
  disableHeader?: boolean
  requestStatus: string | undefined
  filters?: React.ReactChild
  table: React.ReactChild
  failureMsg?: string
  selectionSetting?: {
    selectionAllowed: boolean
    hasSelectInAllPages: boolean
    onSelectionChange: (val: boolean) => void
    label: string
  },
  selectedCount?: number
}

const { I18n } = window

const TableLayout1: FC<Props & PropsFromRedux> = ({
  recordCount, loading, filters, table, requestStatus,
  disableHeader, failureMsg, selectionSetting, selectedCount, errors,
}) => {
  const requestFailed = requestStatus === 'failed'

  if (hasErrorsToHandle(errors.errors)?.statusCode) {
    return null
  }

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
              selectedCount={selectedCount ?? 0}
              totalCount={requestFailed ? 0 : recordCount || 0}
              isLoading={loading}
            />
          </Col>
          <Col>
            {filters}
          </Col>
        </Row>
      )}
      {selectionSetting?.selectionAllowed && (
        <div className="pb-4">
          <Row>
            <Col>
              <Checkbox
                checked={selectionSetting.hasSelectInAllPages && recordCount === selectedCount}
                onChange={e => selectionSetting.onSelectionChange(e.target.checked)}
                className="font-normal text-nowrap flex items-center"
                indeterminate={selectionSetting.hasSelectInAllPages && recordCount !== selectedCount}
              >
                {selectionSetting.label}
              </Checkbox>
            </Col>
          </Row>
        </div>
      )}
      {!!selectedCount && (
        <Row className="pb-4 ps-5">
          <Col>
            {selectedCount}
            {' '}
            {I18n.t('common.text.selected')}
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

export const TableLayout = connector(TableLayout1)
