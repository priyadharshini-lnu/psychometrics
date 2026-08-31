import React, { useState } from 'react'
import _ from 'lodash'
import {
  Button, Table, MenuProps, Row, Col, Switch, App,
  Typography,
} from 'antd'
import type { MessageInstance } from 'antd/es/message/interface'
import type { ModalStaticFunctions } from 'antd/es/modal/confirm'
import { Link, useParams } from 'react-router-dom'
import { ExclamationCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { PropsFromRedux } from './connect'
import { ParentResourceType } from '~/modules/admin/components/PushWebhookModal/constants'
import UserReport from '~/modules/admin/modules/campaigns/interfaces/UserReport'
import DetailsDrawer from '../DetailsDrawer'

const { Column } = Table
const { I18n } = window

interface OwnProps {
  openModal(name: string, data?): void
}

export type Props = OwnProps & PropsFromRedux

const ReportList: React.FC<Props> = ({
  reports: {
    list,
  },
  selectRecords,
  remove,
  openModal,
  regenerateReports,
  toggleUserAccess,
  removeFile,
}) => {
  const [drawerReport, setDrawerReport] = useState<UserReport | undefined>()
  const { campaignId, projectId, id: userId } = useParams() as {
    campaignId: string
    projectId: string
    id: string
  }
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedProjectId = parseInt(projectId, 10)
  const { modal, message } = App.useApp()

  const handleRegenerateReports = (
    selectedReports: { [key: string]: string[] },
    reportId: number,
  ) => {
    regenerateReports(parsedCampaignId, selectedReports, userId, [reportId]).then(() => {
      message.success(I18n.t('user_reports.messages.regenerate_successful'))
    })
  }

  return (
    <Row>
      <Col span={24}>
        <Table
          className="mtm"
          rowKey="id"
          dataSource={list}
          rowSelection={{
            type: 'checkbox',
            onChange: (ids: number[]) => { selectRecords(ids) },
            getCheckboxProps: record => ({
              disabled: !record.permissions.downloadReport,
            }),
          }}
        >
          <Column
            title={I18n.t('common.column.id')}
            dataIndex="reportId"
            key="reportId"
          />
          <Column
            title={I18n.t('campaign_report.column.report_name')}
            key="name"
            dataIndex="name"
            render={(text, record: UserReport) => (
              <>
                <Button type="link" size="small" className="p-0" onClick={() => setDrawerReport(record)}>
                  {text}
                </Button>
                {record.hoganParticipantId && (
                  <Typography.Text style={{ display: 'block', fontSize: '0.8em' }}>
                    (
                    {record.hoganParticipantId}
                    )
                  </Typography.Text>
                )}
              </>
            )}
          />
          <Column
            title={I18n.t('campaign_report.column.report_bundle')}
            key="reportFamilyName"
            dataIndex="reportFamilyName"
          />
          <Column
            title={I18n.t('common.column.status')}
            key="status"
            render={({ status }) => I18n.t(`user_reports.statuses.${status}`)}
          />
          <Column
            title={I18n.t('campaign_report.column.user_access')}
            key="userAccess"
            render={({ userAccess, id, permissions }) => (
              <Switch
                checked={userAccess}
                disabled={!permissions.toggleAccess}
                onChange={() => {
                  toggleUserAccess(parsedCampaignId, id)
                }}
              />
            )}
          />
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={(userReport: UserReport) => (
              <ConditionalDropdown
                menu={
                  getActionsMenuProps({
                    projectId: parsedProjectId,
                    campaignId: parsedCampaignId,
                    userId,
                    userReport,
                    remove: () => remove(parsedCampaignId, userReport.id),
                    removeFile: () => removeFile(parsedCampaignId, userReport.id),
                    onRegenerateReports: handleRegenerateReports,
                    openModal,
                    modal,
                    message,
                  })
                }
              />
            )}
          />
        </Table>
        {drawerReport ? (
          <DetailsDrawer
            close={() => setDrawerReport(undefined)}
            report={drawerReport}
          />
        ) : null}
      </Col>
    </Row>
  )
}

interface ActionMenuData {
  projectId: number
  campaignId: number
  userId: string
  userReport: UserReport
  remove(): void
  removeFile(): void
  onRegenerateReports(selectedReports: { [key: string]: string[] }, reportId: number): void
  openModal(string, data?): void
  modal: Omit<ModalStaticFunctions, 'warn'>
  message: MessageInstance
}

const getActionsMenuProps = ({
  campaignId, userReport, projectId, remove,
  openModal, removeFile, modal, message, userId, onRegenerateReports,
}:ActionMenuData):MenuProps => {
  const {
    id: userReportId, name: userReportName, commentsCount, editsCount, permissions,
    internal, customUpload, availableLanguages, reportDownloadUrls, reportIconUrl, effectiveDefaultLanguage,
  } = userReport

  const reportUrlExists = !_.isEmpty(reportDownloadUrls)
  const previewUrl = () => {
    if (internal) {
      return `/admin/projects/${projectId}/new_campaigns/${campaignId}/user_reports/${userReportId}`
    }

    return `/admin/projects/${projectId}/new_campaigns/${campaignId}/external_user_report/${userReportId}`
  }
  const handleDelete = () => {
    modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: (
        <span style={{ fontWeight: 'bold', color: 'red' }}>
          {(() => {
            if (commentsCount > 0 && editsCount > 0) {
              return I18n.t('user_reports.modals.remove.content_with_counts.both', {
                userReportName,
                commentsCount,
                editsCount,
              })
            } if (commentsCount > 0) {
              return I18n.t('user_reports.modals.remove.content_with_counts.comments', {
                userReportName,
                commentsCount,
              })
            } if (editsCount > 0) {
              return I18n.t('user_reports.modals.remove.content_with_counts.edits', {
                userReportName,
                editsCount,
              })
            }
            return I18n.t('user_reports.modals.remove.content', {
              userReportName,
            })
          })()}
        </span>
      ),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        remove()
        message.success(I18n.t('user_reports.modals.remove.successfully', { userReportName }))
      },
    })
  }

  const handleRemoveFile = () => {
    modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('user_reports.modals.remove_file.content', { userReportName }),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        removeFile()
        message.success(I18n.t('user_reports.modals.remove_file.successfully', { userReportName }))
      },
    })
  }

  const menuItems: MenuItem[] = []
  permissions.viewReport && (internal || reportUrlExists) && menuItems.push({
    key: 'viewReport',
    label: (
      <Link to={previewUrl()}>
        {I18n.t('reports.actions.view')}
      </Link>),
  })
  reportUrlExists && permissions.downloadReport && menuItems.push({
    key: 'downloadReport',
    label: I18n.t('reports.actions.download'),
  })
  permissions.uploadFile && customUpload && menuItems.push({
    key: 'uploadFile',
    label: 'Upload File',
  })
  permissions.removeFile && customUpload && reportUrlExists && menuItems.push({
    key: 'removeFile',
    label: 'Remove File',
  })
  permissions.remove && menuItems.push({
    key: 'remove',
    label: I18n.t('common.actions.remove'),
  })
  permissions.pushWebhook && menuItems.push({
    label: 'Push Webhook',
    key: 'pushWebhook',
  })

  const handleMenuClick = ({ key }) => {
    if (key === 'remove') {
      handleDelete()
    }
    if (key === 'pushWebhook') {
      return openModal('PushWebhookModal', {
        campaignId,
        projectId,
        parentId: userReportId,
        parentType: ParentResourceType.UserReport,
        testMode: false,
      })
    }
    if (key === 'uploadFile') {
      return openModal('UploadFileModal', {
        campaignId,
        parentId: userReportId,
      })
    }
    if (key === 'removeFile') {
      handleRemoveFile()
    }
    if (key === 'downloadReport') {
      openModal('DownloadIndividualReportModal', {
        allLocales: availableLanguages,
        defaultLocale: effectiveDefaultLanguage,
        reportName: userReportName,
        reportIcon: reportIconUrl,
        reportDownloadUrl: reportDownloadUrls,
        onRegenerateReport: (selectedLocale) => {
          onRegenerateReports({
            [userReport.reportId]: selectedLocale,
          }, userReport.id)
        },
        subjectId: userId,
        campaignId,
      })
    }
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}

export default ReportList
