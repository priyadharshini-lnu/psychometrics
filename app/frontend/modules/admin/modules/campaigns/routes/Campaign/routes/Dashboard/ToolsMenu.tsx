import React, { useEffect, useState } from 'react'
import {
  Button, Dropdown, Menu, message, Modal,
} from 'antd'
import {
  DownOutlined, ToolOutlined, FilePdfOutlined, LoadingOutlined,
} from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import { Dashboard } from '~/modules/admin/modules/campaigns/core/dashboard'
import { exportDashboardFile } from '~/modules/admin/modules/campaigns/core/exportDashboardFile'

interface ToolsMenuProps {
  campaignId: string
  projectId: string
  dashboard: Dashboard
}

export const ToolsMenu: React.FC<ToolsMenuProps> = ({ campaignId, projectId, dashboard }) => {
  const [isExporting, setIsExporting] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [exportFormat, setExportFormat] = useState<'PDF' | 'PPTX'>('PDF')
  const [onlyCurrentTab, setOnlyCurrentTab] = useState(false)
  const { I18n } = window
  const dispatch = useDispatch()

  useEffect(() => {
  }, [dashboard])

  const handleFileExport = () => {
    setIsModalVisible(true)
  }

  const handleExportConfirm = () => {
    setIsExporting(true)
    setIsModalVisible(false)
    const currentPageName = (window as { currentPowerBiPageName?: string | null }).currentPowerBiPageName || null
    try {
      dispatch(exportDashboardFile(
        campaignId,
        projectId,
        dashboard.id,
        dashboard.dashboardType,
        dashboard.reportId ?? '',
        dashboard.datasetId ?? '',
        'dashboard_pdf_export',
        exportFormat,
        onlyCurrentTab,
        currentPageName,
      ))
      message.success(I18n.t('administration.dashboard.export_job_success'))
    } catch (error) {
      console.error('Failed to start export:', error)
      message.error(I18n.t('administration.dashboard.export_job_failure'))
    } finally {
      setIsExporting(false)
    }
  }

  const menuItems = [
    {
      key: 'export-file',
      icon: <FilePdfOutlined />,
      label: I18n.t('administration.dashboard.export_dashboard_to_file'),
      onClick: handleFileExport,
      disabled: isExporting,
    },
  ]

  const menu = (
    <Menu
      items={menuItems}
      style={{ minWidth: 150 }}
    />
  )

  return (
    <>
      <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
        <Button
          type="default"
          icon={isExporting ? <LoadingOutlined /> : <ToolOutlined />}
          disabled={isExporting}
        >
          Tools
          {' '}
          {!isExporting && <DownOutlined />}
        </Button>
      </Dropdown>
      <Modal
        title={I18n.t('administration.dashboard.export_dashboard_to_file')}
        visible={isModalVisible}
        onOk={handleExportConfirm}
        onCancel={() => setIsModalVisible(false)}
        okButtonProps={{ disabled: isExporting }}
        cancelButtonProps={{ disabled: isExporting }}
        okText={I18n.t('common.actions.export')}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>
            {I18n.t('administration.dashboard.choose_file_format')}
          </label>
          <select
            value={exportFormat}
            onChange={e => setExportFormat(e.target.value as 'PDF' | 'PPTX')}
            style={{ width: '100%' }}
          >
            <option value="PDF">{I18n.t('administration.dashboard.pdf')}</option>
            <option value="PPTX">{I18n.t('administration.dashboard.pptx')}</option>
          </select>
        </div>
        {/* Checkboxes */}
        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>
            <input type="checkbox" style={{ marginRight: 8 }} onChange={e => setOnlyCurrentTab(e.target.checked)} />
            {I18n.t('administration.dashboard.only_export_current_tab')}
          </label>
        </div>
      </Modal>
    </>
  )
}
