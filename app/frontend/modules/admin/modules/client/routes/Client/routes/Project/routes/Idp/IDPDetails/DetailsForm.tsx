import {
  Form, Input, Switch, Card, Col, Row, Button, Select, Spin, message, Space,
} from 'antd'
import _ from 'lodash'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import {
  useCallback, useEffect, useMemo, useState,
} from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import {
  Idp, IdpTR, Skill, Report, ReportTR,
} from '~/modules/admin/modules/client/core/idp'


const { I18n } = window

export type CategorizedSkills = {
  behavioralGlobalSkills: Skill[],
  behavioralClientSkills: Skill[],
  technicalGlobalSkills: Skill[],
  technicalClientSkills: Skill[],
}

type IDPDetailsFormProps = {
  idp: Idp,
  fetch: () => void,
}

const IDPDetailsForm = ({
  idp, fetch,
}: IDPDetailsFormProps) => {
  const clientId = useSelector<RootState>(state => state.project.clientId)
  const { projectId } = useParams() as { projectId: string, id: string }

  const [form] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)
  const aiEnabled = Form.useWatch('aiEnabled', form)


  const baseApiConfig = {
    basePath: `projects/${projectId}`,
    trackUrl: true,
    responseType: IdpTR,
    apiConfig: {
      fields: {
        skills: ['id', 'name', 'skill_type', 'project_id'],
      },
      include: ['skills', 'report'],
    },
  }

  const { updateResource: update } = useResources<Idp>('idp_templates', baseApiConfig)


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

  useEffect(() => {
    if (idp) {
      form.setFieldsValue({
        name: idp.name,
        description: idp.description,
        self_rating_enabled: idp?.selfRatingEnabled ?? false,
      })
    }
  }, [idp, form])

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      const values = await form.validateFields()

      const payload = {
        name: values.name,
        description: values.description,
        project: { id: projectId, type: 'projects' },
        report: values.reportId ? { id: values.reportId, type: 'reports' } : undefined,
        selfRatingEnabled: values.selfRatingEnabled,
        aiEnabled: values.aiEnabled,
        aiAssistedIdpEnabled: values.aiAssistedIdpEnabled,
        oneClickIdpEnabled: values.oneClickIdpEnabled,
      }

      try {
        await update({ id: idp.id, ...payload })
        message.success(I18n.t('administration.idp.details_updated'))
      } catch (e) {
        if (e?.base?.[0]) {
          message.error(e?.base?.[0]?.title)
        }
      }

      fetch()
    } finally {
      setIsLoading(false)
    }
  }

  const initialValues = useMemo(() => {
    const skills: Record<keyof CategorizedSkills, string[]> = {
      behavioralGlobalSkills: [],
      behavioralClientSkills: [],
      technicalGlobalSkills: [],
      technicalClientSkills: [],
    }

    if (idp) {
      return {
        name: idp.name,
        description: idp.description,
        selfRatingEnabled: idp?.selfRatingEnabled ?? false,
        behavioralGlobalTags: idp.behaviouralGlobalTags,
        behavioralClientTags: idp.behaviouralClientTags,
        technicalGlobalTags: idp.technicalGlobalTags,
        technicalClientTags: idp.technicalClientTags,
        reportId: idp.report?.id,
        titleText: idp.titleText,
        subtitleText: idp.subtitleText,
        fields: idp.fields,
        showReflections: idp.showReflections,
        logoType: idp.logoType,
        aiEnabled: idp.aiEnabled,
        aiAssistedIdpEnabled: idp.aiAssistedIdpEnabled,
        oneClickIdpEnabled: idp.oneClickIdpEnabled,
        skillSourcePreference: idp.skillSourcePreference,
        ...skills,
      }
    }
    return {
      selfRatingEnabled: true,
      fields: [],
    }
  }, [idp])

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
    <Form form={form} layout="vertical" initialValues={initialValues}>
      <Space direction="vertical" className="w-100">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
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
              <Form.Item
                name="aiEnabled"
                label={I18n.t('administration.idp.ai_enabled')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>
          {aiEnabled && (
            <Col xs={24} md={12}>
              <Card title={I18n.t('administration.idp.ai_settings')}>
                <Form.Item
                  name="aiAssistedIdpEnabled"
                  label={I18n.t('administration.idp.ai_assisted_idp_enabled')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="oneClickIdpEnabled"
                  label={I18n.t('administration.idp.one_click_idp_enabled')}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                {/* commented till AI Skill generation implemented
                  <Form.Item name="skillSourcePreference" label={I18n.t('administration.idp.skill_source_preference')}>
                  <Radio.Group>
                    <Radio value="from_template">{I18n.t('administration.idp.skill_sources.from_template')}</Radio>
                    <Radio value="from_ai">{I18n.t('administration.idp.skill_sources.from_ai')}</Radio>
                  </Radio.Group>
                </Form.Item> */}
              </Card>
            </Col>
          )}
        </Row>
        <Button
          key="submit"
          type="primary"
          disabled={!idp.allowEdit}
          onClick={handleSubmit}
        >
          {isLoading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.actions.update')}
        </Button>
      </Space>
    </Form>
  )
}

export default IDPDetailsForm
