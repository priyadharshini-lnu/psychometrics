import { useCallback, useState } from 'react'
import {
  Form, Input, Switch, Card, Col, Row, Button, Modal, Select, Spin,
  message,
} from 'antd'
import _ from 'lodash'
import { LoadingOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { Idp, Report, ReportTR } from '~/modules/admin/modules/client/core/idp'

const { I18n } = window

type IDPTemplateFormProps = {
  close: () => void
  idp?: Idp,
  projectId: string,
  clientId: string,
  aiAssistedIdpFeatureEnabled: boolean,
}

const IDPTemplateForm = ({
  close, projectId, clientId, idp,
  aiAssistedIdpFeatureEnabled,
}: IDPTemplateFormProps) => {
  const { resource } = useResourceContext<Idp>()
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const aiEnabled = Form.useWatch('aiEnabled', form)

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
        aiEnabled: values.aiEnabled,
        aiAssistedIdpEnabled: values.aiAssistedIdpEnabled,
        oneClickIdpEnabled: values.oneClickIdpEnabled,
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
      title={I18n.t(idp ? 'admin.idp_edit_template' : 'admin.idp_idp_template')}
      open={isModalVisible}
      onCancel={close}
      onOk={handleSubmit}
      width="80%"
      style={{ maxWidth: '700px' }}
      okText={I18n.t('shared.add')}
      cancelText={I18n.t('shared.cancel')}
      footer={[
        <Button key="back" onClick={close}>
          {I18n.t('shared.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
        >
          {isLoading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('shared.add')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={24}>
            <Card title={I18n.t('admin.idp_template_details')}>
              <Form.Item
                name="name"
                label={I18n.t('shared.name')}
                rules={[{ required: true, message: I18n.t('admin.idp_enter_template_name_error') }]}
              >
                <Input placeholder={I18n.t('shared.name')} />
              </Form.Item>

              <Form.Item
                name="description"
                label={I18n.t('shared.name')}
                rules={[{ required: true, message: I18n.t('admin.idp_enter_template_description_error') }]}
              >
                <Input placeholder={I18n.t('shared.name')} />
              </Form.Item>

              <Form.Item
                name="reportId"
                label={I18n.t('admin.idp_skill_gap_report')}
              >
                <Select
                  showSearch={{ filterOption: false, onSearch: debouncedFetchReports }}
                  notFoundContent={isReportLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
                  placeholder={I18n.t('admin.idp_select_skill_gap_report')}
                >
                  {reports.map(({ id, name }) => (
                    <Select.Option key={id} value={id}>{name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="selfRatingEnabled" label={I18n.t('admin.idp_self_rating')}>
                <Switch checkedChildren={I18n.t('yes')} unCheckedChildren={I18n.t('no')} />
              </Form.Item>
              {aiAssistedIdpFeatureEnabled && (
                <Form.Item
                  name="aiEnabled"
                  label={I18n.t('admin.idp_ai_enabled')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              )}
              {aiEnabled && (
                <>
                  {/* uncomment this when AI Assisted IDP is ready
                  <Form.Item
                    name="aiAssistedIdpEnabled"
                    label={I18n.t('admin.idp_ai_assisted_idp_enabled')}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item> */}
                  <Form.Item
                    name="oneClickIdpEnabled"
                    label={I18n.t('admin.idp_one_click_idp_enabled')}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </>
              )}
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default IDPTemplateForm
