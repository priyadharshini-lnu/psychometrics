import { useResources } from 'hooks/useResources'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Dashboard as DashboardType, DashboardTR } from 'modules/admin/modules/campaigns/core/dashboard'
import {
  Button, Col, Form, Input, Row, Skeleton, Switch,
} from 'antd'
import ResourceForm from 'components/ResourceForm'

const { I18n } = window

export const Settings: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string, projectId: string }>()
  const {
    updateResource, fetch, data, isLoading,
  } = useResources<DashboardType>('dashboards', { responseType: DashboardTR })

  useEffect(() => {
    fetch({
      apiConfig: {
        filter: { campaign_id_eq: campaignId },
      },
    })
  }, [])

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
    </Row>
  )
}
