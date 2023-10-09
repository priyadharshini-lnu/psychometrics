import React, { useEffect } from 'react'
import {
  Dropdown, Table, Button, Row, Col, Pagination, message, Modal, MenuProps,
} from 'antd'
import {
  CheckOutlined, CloseOutlined, PlusOutlined, AppstoreOutlined, MoreOutlined,
  QrcodeOutlined, DownloadOutlined, CopyOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons'
import moment from 'moment'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import withEnhancedTable from '~/modules/admin/hoc/withEnhancedTable'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import { RegistrationCode } from '~/modules/admin/modules/campaigns/core/registrationCodes'
import { DEFAULT_PAGE_SIZE } from '~/constants/campaign'
import Modals from '~/modules/admin/components/Modals'
import { SafeHTML } from '~/components/SafeHTML'
import { formatedDate } from '~/utils/time'
import CodeModal from './CodeModal'

const MODALS = {
  CodeModal,
}
const { Column } = Table
const { I18n } = window

interface Props {
  fetch(campaignId: string, tableConfig: TableConfig): void
  destroy(campaignId: string, id: number): void
  list: RegistrationCode[],
  permissions: {
    create: boolean
  },
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
  permissions,
  match: { params: { campaignId } },
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
        {permissions.create && (
          <div className="float-r">
            <div>
              <Button type="primary" onClick={() => openModal('CodeModal', { campaignId })}>
                <PlusOutlined />
                <span>Add Code</span>
              </Button>
            </div>
          </div>
        )}
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
              title={I18n.t('registration_code.restricted_domains')}
              key="restrictedDomains"
              render={({ restrictedDomains }) => (restrictedDomains ? restrictedDomains.split('\n').length : 0)}
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
                  {code.permissions.copy && (
                    <CopyToClipboard
                      text={code.url}
                      onCopy={() => message.info('URL is copied to clipboard successfully')}
                    >
                      <Button type="text" icon={<CopyOutlined />} />
                    </CopyToClipboard>
                  )}
                  {code.permissions.downloadQrcode && (
                    <Dropdown
                      menu={getQRCodeMenuProps({ campaignId, code })}
                      trigger={['click']}
                    >
                      <Button type="text" icon={<QrcodeOutlined />} />
                    </Dropdown>
                  )}
                  <ConditionalDropdown
                    menu={getActionsMenuProps({
                      onEdit: () => openModal('CodeModal', {
                        campaignId,
                        code: {
                          ...code,
                          startDate: moment(code.startDate),
                          endDate: moment(code.endDate),
                          disabled: !code.disabled,
                        },
                      }),
                      onCancelConfirm: () => destroy(campaignId, code.id),
                      permissions: code.permissions,
                      code,
                    })}
                    innerElement={(
                      <Button type="link">
                        <MoreOutlined />
                      </Button>
                    )}
                  />
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

interface ActionMenuData {
  onEdit(): void
  onCancelConfirm(): void
  permissions: {
    edit: boolean
    remove: boolean
  }
  code: RegistrationCode
}

interface QRCodeMenuData {
  campaignId: string
  code: RegistrationCode
}

const getQRCodeMenuProps = ({
  code: { id },
  campaignId,
}:QRCodeMenuData):MenuProps => {
  const menuItems = [
    {
      key: 'png',
      icon: <DownloadOutlined />,
      label: (
        <a
          download
        // eslint-disable-next-line max-len
          href={`/administration/new_campaigns/${campaignId}/registration_codes/${id}/download_qrcode.png`}
        >
          PNG
        </a>
      ),
    },
    {
      key: 'svg',
      icon: <DownloadOutlined />,
      label: (
        <a
          download
        // eslint-disable-next-line max-len
          href={`/administration/new_campaigns/${campaignId}/registration_codes/${id}/download_qrcode.svg`}
        >
          SVG
        </a>
      ),
    },
  ]
  return ({ items: menuItems })
}

const getActionsMenuProps = ({
  onEdit, onCancelConfirm, permissions, code: { code },
}:ActionMenuData): MenuProps => {
  const handleRemove = () => {
    Modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: <SafeHTML html={I18n.t('registration_code.modals.remove.content', { code })} />,
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        onCancelConfirm()
        message.success(I18n.t('registration_code.modals.remove.successfully', { code }))
      },
    })
  }

  const menuItems: ItemType[] = []
  permissions.edit && menuItems.push({
    key: 'edit',
    label: 'Edit',
  })
  permissions.remove && menuItems.push({
    key: 'remove',
    label: 'Remove',
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      onEdit()
    }
    if (key === 'remove') {
      handleRemove()
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export default withEnhancedTable(RegistrationCodes, 'RegistrationCodes', { maintainHistory: true })
