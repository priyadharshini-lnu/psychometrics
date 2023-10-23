import { FC } from 'react'
import {
  Drawer, Row, Descriptions, Avatar,
} from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
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
      visible
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
          <Descriptions.Item label={I18n.t('common.column.active')} key="active" className="va-t">
            {!report.disabled ? <CheckOutlined /> : <CloseOutlined />}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.icon')} key="icon" className="va-t">
            <ResourceAvatar
              url={report.iconUrl}
              color={report.iconColor}
              name={report.name}
            />
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.poster')} key="poster" className="va-t">
            {report.poster && <Avatar shape="square" src={report.poster} />}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.name')} key="name" className="va-t">
            {report.name}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.assessments')} key="assessments" className="va-t">
            <Avatar.Group maxCount={2}>
              {report.assessments.map(assessment => (
                <ResourceAvatar
                  key={assessment.id}
                  name={assessment.name}
                />
              ))}
            </Avatar.Group>
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.owner')} key="owner" className="va-t">
            {report.owner?.name}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.updated_at')} key="updated_at" className="va-t">
            {report.updatedAt}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.created_by')} key="created_by" className="va-t">
            {report.createdBy}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.created_at')} key="created_at" className="va-t">
            {report.createdAt}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.modified_by')} key="modified_by" className="va-t">
            {report.modifiedBy}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('reports.columns.data_only')} key="data_only" className="va-t">
            {report.dataOnly ? <CheckOutlined /> : <CloseOutlined />}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('reports.columns.default_language')} key="default_language" className="va-t">
            {I18n.t(`languages.${report.defaultLanguage}`)}
          </Descriptions.Item>
        </Descriptions>
      </Row>
    </Drawer>
  )
}
