import React, { useEffect } from 'react'
import {
  Dropdown, Table, Button, Menu, Row, Col, Pagination, message, Popconfirm,
} from 'antd'
import {
  CheckOutlined, CloseOutlined, PlusOutlined, AppstoreOutlined, MoreOutlined,
  QrcodeOutlined, DownloadOutlined, CopyOutlined,
} from '@ant-design/icons'
import withEnhancedTable from 'modules/admin/hoc/withEnhancedTable'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import { RegistrationCode } from 'modules/admin/modules/campaigns/core/registrationCodes'
import { DEFAULT_PAGE_SIZE } from 'constants/campaign'
import Modals from 'modules/admin/components/Modals'
import moment from 'moment'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { formatedDate } from 'utils/time'
import CodeModal from './CodeModal'

const MODALS = {
  CodeModal,
}
const { Column } = Table

interface Props {
  fetch(campaignId: string, tableConfig: TableConfig): void
  destroy(campaignId: string, id: number): void
  list: RegistrationCode[],
  total: number,
  match: {
    params: {
      projectId: string
      campaignId: string
    }
  }
  tableConfig: TableConfig
  onTableChange(): void
  getSortOrder(column: string): 'descend' | 'ascend'
  changePage(page: number): void
  openModal(name: string, data?: { campaignId: string, code?: RegistrationCode }): void
}

const RegistrationCodes: React.FC<Props> = ({
  fetch,
  list,
  total,
  match: { params: { projectId, campaignId } },
  tableConfig: {
    page,
  },
  tableConfig,
  onTableChange,
  getSortOrder,
  changePage,
  openModal,
  destroy,
}) => {
  useEffect(() => {
    fetch(campaignId, tableConfig)
  }, [tableConfig])

  return (
    <div>
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">{`${total} Registration Codes `}</span>
        </Col>
        <div className="float-r">
          <div>
            <Button type="primary" onClick={() => openModal('CodeModal', { campaignId })}>
              <PlusOutlined />
              <span>Add Code</span>
            </Button>
          </div>
        </div>
      </Row>
      <Row>
        <Col span={24}>
          <Table className="mtm" rowKey="id" dataSource={list} onChange={onTableChange} pagination={false}>
            <Column
              title="Active"
              key="active"
              width={40}
              render={({ disabled }) => (disabled ? <CloseOutlined /> : <CheckOutlined />)}
            />
            <Column
              title="Name"
              key="name"
              sorter
              sortOrder={getSortOrder('name')}
              dataIndex="name"
            />
            <Column
              title="Code"
              key="code"
              dataIndex="code"
            />
            <Column
              title="Start date"
              key="startDate"
              render={({ startDate }) => formatedDate(startDate)}
            />
            <Column
              title="End date"
              key="endDate"
              render={({ endDate }) => formatedDate(endDate)}
            />
            <Column
              title="Usage stats"
              key="usage"
              render={({ useCount, totalCount }) => `${useCount} of ${totalCount}`}
            />
            <Column
              title="Action"
              key="action"
              render={code => (
                <>
                  <CopyToClipboard
                    text={code.url}
                    onCopy={() => message.info('URL is copied to clipboard successfully')}
                  >
                    <Button shape="round" icon={<CopyOutlined />} />
                  </CopyToClipboard>
                  <Dropdown
                    overlay={() => (
                      QRCodeMenu({
                        projectId,
                        campaignId,
                        code,
                      }) as React.ReactElement
                    )}
                    trigger={['click']}
                  >
                    <Button shape="round" icon={<QrcodeOutlined />}>
                      QR code
                    </Button>
                  </Dropdown>
                  <Dropdown
                    overlay={() => (
                      ActionsMenu({
                        onEdit: () => openModal('CodeModal', {
                          campaignId,
                          code: {
                            ...code,
                            startDate: moment(code.startDate),
                            endDate: moment(code.endDate),
                            disabled: !code.disabled,
                          },
                        }),
                      }) as React.ReactElement
                    )}
                    trigger={['click']}
                  >
                    <Button type="link">
                      <MoreOutlined />
                    </Button>
                  </Dropdown>
                  <Popconfirm
                    title="Are you sure?"
                    onConfirm={() => destroy(campaignId, code.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button danger shape="round">
                      <CloseOutlined />
                    </Button>
                  </Popconfirm>
                </>
              )}
            />
          </Table>
        </Col>
      </Row>
      <div className="pl">
        <Pagination
          current={page}
          pageSize={DEFAULT_PAGE_SIZE}
          total={total}
          onChange={changePage}
          hideOnSinglePage
        />
      </div>
      <Modals modals={MODALS} />
    </div>
  )
}

interface ActionMenuProps {
  onEdit(): void
}

interface QRCodeMenuProps {
  projectId: string
  campaignId: string
  code: RegistrationCode

}

const QRCodeMenu: React.FC<QRCodeMenuProps> = ({
  code: { id },
  campaignId,
}) => (
  <Menu>
    <Menu.Item key="png">
      <a
        download
        // eslint-disable-next-line max-len
        href={`/administration/new_campaigns/${campaignId}/registration_codes/${id}/download_qrcode.png?type=PNG`}
      >
        <DownloadOutlined />
        {' '}
        PNG
      </a>
    </Menu.Item>
    <Menu.Item key="svg">
      <a
        download
        // eslint-disable-next-line max-len
        href={`/administration/new_campaigns/${campaignId}/registration_codes/${id}/download_qrcode.svg?type=SVG`}
      >
        <DownloadOutlined />
        {' '}
        SVG
      </a>
    </Menu.Item>
  </Menu>
)

const ActionsMenu: React.FC<ActionMenuProps> = ({
  onEdit,
}) => (
  <Menu>
    <Menu.Item key="edit">
      <div
        role="button"
        tabIndex={-1}
        onClick={onEdit}
      >
        Edit
      </div>
    </Menu.Item>
  </Menu>
)

export default withEnhancedTable(RegistrationCodes, 'RegistrationCodes', { maintainHistory: true })
