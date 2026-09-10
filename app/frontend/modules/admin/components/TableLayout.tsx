import React, { FC, ReactNode, useState } from 'react'
import {
  Row, Col, Button, Empty, Checkbox, Flex, Typography, theme,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import {
  DataTableFrame, DataTableExpandButton, DataTablePagination, DataTablePaginationProps,
} from '@thetalententerprise/glint'
import { ReloadOutlined, IssuesCloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { hasErrorsToHandle } from '~/components/ErrorModal/ErrorModal'
import { TableTitle } from '~/modules/admin/components/TableTitle'
import { getRequestErrors } from '~/core/errors'

const connector = connect(state => ({
  ...getRequestErrors(state),
}))

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = {
  recordCount?: number
  disableHeader?: boolean
  requestStatus?: string
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
  loading?: boolean
  title: string
  embedded?: boolean
  controls?: React.ReactNode
  sider?: ReactNode
  siderOpen?: boolean
  pagination?: Pick<
    Extract<DataTablePaginationProps, { page: number }>,
    'page' | 'pageSize' | 'total' | 'onChange' | 'showSizeChanger' | 'hideOnSinglePage'
  >
}

const { I18n } = window

export const SHOW_TITLES = true

const renderTotal = (start: number, end: number, total: number) => (
  I18n.t('shared.table.entries.total', { count: total })
)

const TableLayout1: FC<Props & PropsFromRedux> = ({
  recordCount, filters, table, requestStatus,
  disableHeader, failureMsg, selectionSetting, selectedCount, errors,
  title, embedded, pagination, loading, controls, sider, siderOpen,
}) => {
  const requestFailed = requestStatus === 'failed'
  const [expanded, setExpanded] = useState(false)
  const { token } = theme.useToken()

  if (hasErrorsToHandle(errors.errors)?.statusCode) {
    return null
  }

  const total = pagination?.total ?? recordCount ?? 0
  const paging: DataTablePaginationProps = pagination
    ? { ...pagination, total, showSizeChanger: pagination.showSizeChanger ?? true }
    : { paged: false, total }

  const footer = (
    <DataTablePagination
      {...paging}
      renderTotal={renderTotal}
      controls={(
        <Flex align="center" gap="small">
          <DataTableExpandButton
            expanded={expanded}
            onToggle={() => setExpanded(current => !current)}
            expandLabel={I18n.t('shared.table.expand')}
            collapseLabel={I18n.t('shared.table.collapse')}
          />
          {controls}
        </Flex>
      )}
    />
  )

  const selection = (selectionSetting?.selectionAllowed || !!selectedCount) && (
    <Flex align="center" gap="small" wrap>
      {selectionSetting?.selectionAllowed && (
        <Checkbox
          checked={selectionSetting.hasSelectInAllPages && recordCount === selectedCount}
          onChange={e => selectionSetting.onSelectionChange(e.target.checked)}
          indeterminate={selectionSetting.hasSelectInAllPages && recordCount !== selectedCount}
        >
          {selectionSetting.label}
        </Checkbox>
      )}
      {!!selectedCount && (
        <Typography.Text type="secondary">
          {selectedCount}
          {' '}
          {I18n.t('common.text.selected')}
        </Typography.Text>
      )}
    </Flex>
  )

  const header = !disableHeader && (
    <Row
      justify="space-between"
      align="middle"
      style={{ paddingInline: token.padding, paddingBlock: token.paddingSM }}
    >
      <Col>
        <Flex align="center" gap="middle" wrap>
          {SHOW_TITLES && <TableTitle>{title}</TableTitle>}
          {selection}
        </Flex>
      </Col>
      <Col>
        {filters}
      </Col>
    </Row>
  )

  const content = (
    <>
      {disableHeader && selection && (
        <div style={{ paddingInline: token.padding, paddingBottom: token.paddingSM }}>
          {selection}
        </div>
      )}
      <Row>
        <Col span={24}>
          {requestFailed ? <RequestFailedMessage failureMsg={failureMsg} /> : table}
        </Col>
      </Row>
    </>
  )

  // Frameless while collapsed: the frame bounds its own scroll region, and an embedded table scrolls with the page.
  if (embedded && !expanded) {
    return (
      <Flex vertical>
        {header}
        {content}
        {footer}
      </Flex>
    )
  }

  // Toolbar, not children: the frame keeps it out of the bounded scroll region, so it stays put over the rows.
  return (
    <DataTableFrame
      scrollRegionLabel={title}
      expanded={expanded}
      toolbar={header}
      footer={footer}
      loading={loading}
      sider={sider}
      siderOpen={siderOpen}
    >
      {content}
    </DataTableFrame>
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
