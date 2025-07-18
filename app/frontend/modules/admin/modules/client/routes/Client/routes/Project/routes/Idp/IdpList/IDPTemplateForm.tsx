import { useCallback, useState } from 'react'
import {
  Form, Input, Switch, Card, Col, Row, Button, Modal, Select, Spin,
  message,
} from 'antd'
import _ from 'lodash'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import { useResources } from '~/hooks/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { Idp, Report, ReportTR } from '~/modules/admin/modules/client/core/idp'

const { I18n } = window

type IDPTemplateFormProps = {
  close: () => void
  idp?: Idp,
  projectId: string,
  clientId: string,
}

const IDPTemplateForm = ({
  close, projectId, clientId, idp,
}: IDPTemplateFormProps) => {
  const { resource } = useResourceContext<Idp>()
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const {
    fetch: fetchAvailableReports, data: availableReports, isLoading: isReportLoading,
  } = useResources<Report>('reports', {
    basePath: `clients/${clientId}`,
    responseType: ReportTR,
    trackUrl: true,
    apiConfig: {
      fields: {
        reports: ['name'],
      },
    },
  })

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      const values = await form.validateFields()

      const payload = {
        name: values.name,
        selfRatingEnabled: values.selfRatingEnabled,
        description: values.description,
        project: { id: projectId, type: 'projects' },
        report: values.reportId ? { id: values.reportId, type: 'reports' } : undefined,
      }

      let hasError = false
      try {
        await resource.createResource(payload)
      } catch (e) {
        if (e?.base?.[0]) {
          hasError = true
          message.error(e?.base?.[0]?.title)
        }
      }
      setIsModalVisible(hasError)
      if (!hasError) {
        close()
      }
      resource.fetch()
    } finally {
      setIsLoading(false)
    }
  }

  const debouncedFetchReports = useCallback(_.debounce((value) => {
    if (value.length >= 1) {
      fetchAvailableReports({
        apiConfig: {
          filter: { name_cont: value },
          fields: { reports: ['name'] },
        },
      })
    }
  }, 300), [])

  const reports = idp?.report ? availableReports.concat(idp?.report) : availableReports

  return (
    <Modal
      title={I18n.t(idp ? 'administration.idp.edit_template' : 'administration.idp.idp_template')}
      open={isModalVisible}
      onCancel={close}
      onOk={handleSubmit}
      width="80%"
      style={{ maxWidth: '700px' }}
      okText={I18n.t('common.actions.add')}
      cancelText={I18n.t('common.actions.cancel')}
      footer={[
        <Button key="back" onClick={close}>
          {I18n.t('common.actions.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
        >
          {isLoading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.actions.add')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={24}>
            <Card title={I18n.t('administration.idp.template_details')}>
              <Form.Item
                name="name"
                label={I18n.t('administration.idp.enter_template_name')}
                rules={[{ required: true, message: I18n.t('administration.idp.enter_template_name_error') }]}
              >
                <Input placeholder={I18n.t('administration.idp.enter_template_name')} />
              </Form.Item>

              <Form.Item
                name="description"
                label={I18n.t('administration.idp.enter_template_description')}
                rules={[{ required: true, message: I18n.t('administration.idp.enter_template_description_error') }]}
              >
                <Input placeholder={I18n.t('administration.idp.enter_template_description')} />
              </Form.Item>

              <Form.Item
                name="reportId"
                label={I18n.t('administration.idp.skill_gap_report')}
              >
                <Select
                  showSearch
                  onSearch={debouncedFetchReports}
                  notFoundContent={isReportLoading('fetch') ? <Spin size="small" /> : null}
                  filterOption={false}
                  placeholder={I18n.t('administration.idp.select_skill_gap_report')}
                >
                  {reports.map(({ id, name }) => (
                    <Select.Option key={id} value={id}>{name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="selfRatingEnabled" label={I18n.t('administration.idp.self_rating')}>
                <Switch checkedChildren={I18n.t('yes')} unCheckedChildren={I18n.t('no')} />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default IDPTemplateForm
