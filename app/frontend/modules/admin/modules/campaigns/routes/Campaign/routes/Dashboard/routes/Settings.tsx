import { useResources } from 'hooks/useResources'
import React from 'react'
import { Dashboard as DashboardType, dashboardAtom, DashboardTR } from 'modules/admin/modules/campaigns/core/dashboard'
import {
  Alert,
  Button, Col, Form, Input, message, Row, Skeleton, Switch,
} from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import ResourceForm from 'components/ResourceForm'
import { useRecoilStateStateManager } from 'hooks/useRecoilStateStateManager'
import { useParams } from 'react-router-dom'

const { I18n } = window

export const Settings: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const stateManager = useRecoilStateStateManager(dashboardAtom)
  const {
    updateResource, data, isLoading,
  } = useResources<DashboardType>('dashboards', { responseType: DashboardTR, stateManager })

  if (isLoading('fetch')) return <Skeleton />

  return (
    <Row justify="space-between" className="pl">
      <Col sm={24} md={16} xl={12} xxl={10}>
        <ResourceForm
          resourceName="dashboards"
          readableResourceName={I18n.t('administration.dashboard.tabs.dashboard')}
          resource={data[0]}
          showSuccessMessages
          scrollToFirstError
          request={{
            updateResource,
          }}
        >
          {() => (
            <>
              <Form.Item
                name="enabled"
                label={I18n.t('administration.dashboard_form.fields.enabled')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="name"
                label={I18n.t('common.column.name')}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="datasetId"
                label={I18n.t('administration.dashboard_form.fields.dataset_id')}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="reportId"
                label={I18n.t('administration.dashboard_form.fields.report_id')}
              >
                <Input />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading(`update@${data[0]?.id}`)}
                className="mb-16"
              >
                {I18n.t('common.actions.update')}
              </Button>
            </>
          )}
        </ResourceForm>
      </Col>
      <Col sm={24} md={16} xl={10}>
        <ViewNameInfo campaignId={campaignId} />
      </Col>
    </Row>
  )
}
interface ViewNameInfoProps {
  campaignId: string
}

const ViewNameInfo: React.FC<ViewNameInfoProps> = ({ campaignId }) => (
  <Alert
    message={I18n.t('administration.dashboard.settings.view_names')}
    description={(
      <Form layout="vertical">
        <Form.Item
          label={I18n.t('administration.dashboard.settings.datasheet_view_name')}
          initialValue={`c_${campaignId}_datasheet`}
          name="datasheetView"
        >
          <Input
            readOnly
            suffix={(
              <CopyToClipboard
                text={`c_${campaignId}_datasheet`}
                onCopy={() => {
                  message.info(I18n.t('common.text.copied'))
                }}
              >
                <CopyOutlined />
              </CopyToClipboard>
            )}
          />
        </Form.Item>

        <Form.Item
          label={I18n.t('administration.dashboard.settings.accesssheet_view_name')}
          initialValue={`c_${campaignId}_accesssheet`}
          name="datasheetView"
        >
          <Input
            readOnly
            suffix={(
              <CopyToClipboard
                text={`c_${campaignId}_accesssheet`}
                onCopy={() => {
                  message.info(I18n.t('common.text.copied'))
                }}
              >
                <CopyOutlined />
              </CopyToClipboard>
            )}
          />
        </Form.Item>
      </Form>
)}
    type="info"
    showIcon
  />
)
