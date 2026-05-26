import { FC } from 'react'
import {
  Drawer, Row, Descriptions, Typography, Space,
} from 'antd'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { ResourceAvatar } from '~/glint'

const { I18n } = window

interface Props {
  close: () => void
  assessment: Assessment | undefined
}

export const DetailsDrawer: FC<Props> = ({
  close,
  assessment,
}) => {
  if (!assessment) {
    return null
  }
  const { dimension } = assessment

  return (
    <Drawer
      title={I18n.t('assessments.drawer.title')}
      placement="right"
      closable
      onClose={close}
      open
      width="40%"
    >
      <Row>
        <Descriptions
          layout="horizontal"
          rootClassName="mb-6 w-100"
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
            {assessment.id}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.icon')} key="icon" className="va-t">
            <ResourceAvatar
              url={assessment.iconUrl}
              color={assessment.iconColor}
              name={assessment.name}
            />
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.name')} key="name" className="va-t">
            {assessment.name}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.dimension')} key="dimension" className="va-t">
            {dimension && (
              <Space orientation="vertical">
                <Typography.Text>
                  {I18n.t('common.column.name')}
                  :
                  {' '}
                  {dimension.name}
                </Typography.Text>
                <Typography.Text>
                  {I18n.t('common.column.id')}
                  :
                  {' '}
                  {dimension.id}
                </Typography.Text>
              </Space>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.owner')} key="owner" className="va-t">
            {assessment.owner?.name}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.type')} key="type" className="va-t">
            {I18n.t(`admin.${assessment.type}_assessment`)}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.category')} key="category" className="va-t">
            {I18n.t(`admin.${assessment.category}`)}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.updated_at')} key="updated_at" className="va-t">
            {assessment.updatedAt}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.created_by')} key="created_by" className="va-t">
            {assessment.createdBy}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.created_at')} key="created_at" className="va-t">
            {assessment.createdAt}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('common.column.modified_by')} key="modified_by" className="va-t">
            {assessment.modifiedBy}
          </Descriptions.Item>
        </Descriptions>
      </Row>
    </Drawer>
  )
}
