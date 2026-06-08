import { FC } from 'react'
import {
  Drawer, Row, Descriptions, Avatar, ColorPicker, Typography, Space,
} from 'antd'
import { Report } from '~/modules/admin/modules/client/core/reports'
import { ResourceAvatar } from '~/glint'

const { I18n } = window

interface Props {
  close: () => void
  report: Report | undefined
}

export const DetailsDrawer: FC<Props> = ({
  close,
  report,
}) => {
  if (!report) {
    return null
  }

  return (
    <Drawer
      title={I18n.t('reports.drawer.title')}
      placement="right"
      closable
      onClose={close}
      open
      width="40%"
    >
      <Row>
        <Descriptions
          layout="horizontal"
          className="mb-6 w-100"
          bordered
          column={1}
        >
          <Descriptions.Item
            label={I18n.t('common.column.id')}
            key="id"
            className="va-t w-30"
            labelStyle={{ width: '40%' }}
            contentStyle={{ width: '60%' }}
          >
            {report.id}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('shared.active')} key="active" className="va-t">
            {report.disabled ? I18n.t('admin.common_disabled') : I18n.t('admin.common_enabled')}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('shared.name')} key="name" className="va-t">
            {report.name}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('shared.description')} key="name" className="va-t">
            {report.description || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('shared.icon')} key="icon" className="va-t">
            <ResourceAvatar
              url={report.iconUrl}
              color={report.iconColor}
              name={report.name}
            />
          </Descriptions.Item>
          {report.iconColor
            ? (
              <Descriptions.Item label={I18n.t('common.column.icon_color')} key="description" className="va-t">
                <Space>
                  <ColorPicker defaultValue={report.iconColor} disabled />
                  <Typography.Text type="secondary" copyable>{report.iconColor}</Typography.Text>
                </Space>
              </Descriptions.Item>
            ) : null
          }
          <Descriptions.Item label={I18n.t('common.column.poster')} key="poster" className="va-t">
            {report.poster && <Avatar shape="square" src={report.poster} />}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.assessments')} key="assessments" className="va-t">
            <Avatar.Group max={{ count: 2 }}>
              {report.assessments.map(assessment => (
                <ResourceAvatar
                  key={assessment.id}
                  name={assessment.name}
                />
              ))}
            </Avatar.Group>
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('shared.owner')} key="owner" className="va-t">
            {report.owner?.name}
          </Descriptions.Item>
          {report.externalReport && (
            <Descriptions.Item
              label={I18n.t('common.column.external_report_id')}
              key="external_report_id"
              className="va-t"
            >
              {report.externalSettings?.reportId}
            </Descriptions.Item>
          )}
          <Descriptions.Item label={I18n.t('shared.last_updated')} key="updated_at" className="va-t">
            {report.updatedAt}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('shared.created_by')} key="created_by" className="va-t">
            {report.createdBy}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('shared.created_at')} key="created_at" className="va-t">
            {report.createdAt}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('shared.modified_by')} key="modified_by" className="va-t">
            {report.modifiedBy}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('reports.columns.data_only')} key="data_only" className="va-t">
            {report.dataOnly ? I18n.t('admin.common_enabled') : I18n.t('admin.common_disabled')}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('reports.fields.provider.custom_upload')}
            key="custom_upload"
            className="va-t"
          >
            {
              report.provider === 'custom_upload'
                ? I18n.t('admin.common_enabled') : I18n.t('admin.common_disabled')
            }
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('reports.columns.default_language')} key="default_language" className="va-t">
            {I18n.t(`languages.${report.defaultLanguage}`)}
          </Descriptions.Item>
        </Descriptions>
      </Row>
    </Drawer>
  )
}
