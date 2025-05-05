import {
  Form, Input, Switch, Card, Col, Row, Button, Modal, Select, Spin, Radio,
  Tabs, Flex, Checkbox, Upload, Image,
  message,
  Tooltip,
} from 'antd'
import _ from 'lodash'
import { LoadingOutlined, CheckOutlined, UploadOutlined } from '@ant-design/icons'
import {
  useCallback, useEffect, useMemo, useState,
} from 'react'
import { useResources } from '~/hooks/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource'
import SkillsAndTagsSelection, { SkillsOption } from './SkillsAndTagsSelection'
import {
  Idp, Skill, Report, ReportTR,
} from '~/modules/admin/modules/client/core/idp'

const { I18n } = window

export type CategorizedSkills = {
  behavioralGlobalSkills: Skill[],
  behavioralClientSkills: Skill[],
  technicalGlobalSkills: Skill[],
  technicalClientSkills: Skill[],
}

const LOGO_TYPE = {
  both: 'both',
  mercer_only: 'mercer_only',
  client_only: 'client_only',
  none: 'none',
}

const FIELDS = [
  'name',
  'role',
  'assigned_data',
  'division',
  'review_date',
  'publish_date',
  'completion_date',
]

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
  const [categorizedSkills, setCategorizedSkills] = useState<CategorizedSkills>({
    behavioralGlobalSkills: [],
    behavioralClientSkills: [],
    technicalGlobalSkills: [],
    technicalClientSkills: [],
  })

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
      const skills: Pick<Skill, 'id'>[] = _.flatten([
        values.behavioralGlobalSkills || [],
        values.behavioralClientSkills || [],
        values.technicalGlobalSkills || [],
        values.technicalClientSkills || [],
      ]).map((skill: string) => ({ id: skill }))

      const payload = {
        name: values.name,
        selfRatingEnabled: values.selfRatingEnabled,
        description: values.description,
        skills,
        behaviouralGlobalTags: values.behavioralGlobalTags || [],
        behaviouralClientTags: values.behaviouralClientTags || [],
        technicalGlobalTags: values.technicalGlobalTags || [],
        technicalClientTags: values.technicalClientTags || [],
        behavioralGlobalSkillSettings: values.behavioralGlobalSkillSettings,
        behavioralClientSkillSettings: values.behavioralClientSkillSettings,
        technicalGlobalSkillSettings: values.technicalGlobalSkillSettings,
        technicalClientSkillSettings: values.technicalClientSkillSettings,
        project: { id: projectId, type: 'projects' },
        report: values.reportId ? { id: values.reportId, type: 'reports' } : undefined,
        titleText: values.titleText,
        subtitleText: values.subtitleText,
        logoType: values.logoType,
        fields: values.fields,
        showReflections: values.showReflections,
      }

      let hasError = false
      try {
        if (idp) {
          await resource.updateResource({ id: idp.id, ...payload })
        } else {
          await resource.createResource(payload)
        }
      } catch (e) {
        if (e?.base?.[0]) {
          hasError = true
          message.error(e?.base?.[0]?.title)
        }
      }

      if (idp && (values.background || values.clientLogo || values.removeBackground || values.removeClientLogo)) {
        const data = new FormData()
        if (values.background && values.background.file) {
          data.append('background', values.background.file)
        }
        if (values.clientLogo && values.clientLogo.file) {
          data.append('client_logo', values.clientLogo.file)
        }
        if (values.removeBackground) {
          data.append('purge_background', 'true')
        }
        if (values.removeClientLogo) {
          data.append('purge_client_logo', values.removeClientLogo)
        }
        try {
          await resource.uploadFileAction(`idp_templates/${idp.id}/uploads`, data)
        } catch (e) { /* empty */ }
      }

      setIsModalVisible(hasError)
      resource.fetch()
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
    const newCategorizedSkills = idp?.skills?.reduce((acc, skill) => {
      if (skill.category === 'behavioral' && !skill.projectId) {
        acc.behavioralGlobalSkills.push(skill)
        skills.behavioralGlobalSkills.push(skill.id)
      } else if (skill.category === 'behavioral' && skill.projectId) {
        acc.behavioralClientSkills.push(skill)
        skills.behavioralClientSkills.push(skill.id)
      } else if (skill.category === 'technical' && !skill.projectId) {
        acc.technicalGlobalSkills.push(skill)
        skills.technicalGlobalSkills.push(skill.id)
      } else if (skill.category === 'technical' && skill.projectId) {
        acc.technicalClientSkills.push(skill)
        skills.technicalClientSkills.push(skill.id)
      }
      return acc
    }, categorizedSkills) || categorizedSkills

    setCategorizedSkills(newCategorizedSkills)

    if (idp) {
      return {
        name: idp.name,
        description: idp.description,
        selfRatingEnabled: idp?.selfRatingEnabled ?? false,
        behavioralGlobalTags: idp.behaviouralGlobalTags,
        behavioralClientTags: idp.behaviouralClientTags,
        technicalGlobalTags: idp.technicalGlobalTags,
        technicalClientTags: idp.technicalClientTags,
        behavioralGlobalSkillSettings: idp.behavioralGlobalSkillSettings || SkillsOption.NONE,
        behavioralClientSkillSettings: idp.behavioralClientSkillSettings || SkillsOption.NONE,
        technicalGlobalSkillSettings: idp.technicalGlobalSkillSettings || SkillsOption.NONE,
        technicalClientSkillSettings: idp.technicalClientSkillSettings || SkillsOption.NONE,
        reportId: idp.report?.id,
        titleText: idp.titleText,
        subtitleText: idp.subtitleText,
        fields: idp.fields,
        showReflections: idp.showReflections,
        logoType: idp.logoType,
        ...skills,
      }
    }
    return {
      selfRatingEnabled: true,
      behavioralGlobalSkillSettings: SkillsOption.NONE,
      behavioralClientSkillSettings: SkillsOption.NONE,
      technicalGlobalSkillSettings: SkillsOption.NONE,
      technicalClientSkillSettings: SkillsOption.NONE,
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
    <Modal
      title={I18n.t(idp ? 'administration.idp.edit_template' : 'administration.idp.idp_template')}
      open={isModalVisible}
      onCancel={close}
      onOk={handleSubmit}
      width="80%"
      style={{ maxWidth: '1024px' }}
      okText={I18n.t(idp ? 'common.actions.update' : 'common.actions.add')}
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
          {I18n.t(idp ? 'common.actions.update' : 'common.actions.add')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
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
          <Col xs={24} md={16}>
            <Tabs
              defaultActiveKey="skills"
              items={[
                {
                  label: I18n.t('administration.idp.skills'),
                  key: 'skills',
                  forceRender: true,
                  children: (
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Card title={I18n.t('administration.idp.behavioral_skills')}>
                          <SkillsAndTagsSelection
                            categorizedSkills={categorizedSkills}
                            category="behavioral"
                            type="Global"
                            form={form}
                          />
                          <SkillsAndTagsSelection
                            categorizedSkills={categorizedSkills}
                            category="behavioral"
                            type="Client"
                            projectId={projectId}
                            form={form}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} md={12}>
                        <Card title={I18n.t('administration.idp.technical_skills')}>
                          <SkillsAndTagsSelection
                            categorizedSkills={categorizedSkills}
                            category="technical"
                            type="Global"
                            form={form}
                          />
                          <SkillsAndTagsSelection
                            categorizedSkills={categorizedSkills}
                            category="technical"
                            type="Client"
                            projectId={projectId}
                            form={form}
                          />
                        </Card>
                      </Col>
                    </Row>
                  ),
                },
                {
                  label: idp
                    ? I18n.t('administration.idp.appearance')
                    : (
                      <Tooltip title={I18n.t('administration.idp.appearance_hint')}>
                        {I18n.t('administration.idp.appearance')}
                      </Tooltip>
                    ),
                  forceRender: true,
                  key: 'appearance',
                  disabled: !idp,
                  children: (
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item name="logoType" label={I18n.t('administration.idp.logo_type_label')}>
                          <Radio.Group>
                            <Flex vertical>
                              {_.map(LOGO_TYPE, (type, key) => (
                                <Radio key={key} value={type}>
                                  {I18n.t(`administration.idp.logo_type.${key}`)}
                                </Radio>
                              ))}
                            </Flex>
                          </Radio.Group>
                        </Form.Item>
                        <Card className="p-4" bodyStyle={{ padding: 0 }}>

                          <Form.Item
                            name="background"
                            label={I18n.t('administration.idp.background_image')}
                          >
                            <Upload
                              listType="picture"
                              maxCount={1}
                              accept=".jpeg, .jpg, .png, .svg, .gif, .bmp, image/jpeg, image/png, image/svg+xml"
                              beforeUpload={() => false}
                            >
                              <Button icon={<UploadOutlined />}>
                                {I18n.t('administration.projects.design_settings.logo_upload')}
                              </Button>
                            </Upload>
                            {idp?.background && <Image className="mt-4" height={100} src={idp?.background} />}
                          </Form.Item>
                          {idp?.background && (
                            <Form.Item
                              name="removeBackground"
                              valuePropName="checked"
                              noStyle
                            >
                              <Checkbox disabled={!idp?.background}>
                                {I18n.t('administration.idp.remove')}
                              </Checkbox>
                            </Form.Item>
                          )}
                        </Card>
                        <Card className="p-4" bodyStyle={{ padding: 0 }}>
                          <Form.Item
                            name="clientLogo"
                            label={I18n.t('administration.idp.logo_image')}
                          >
                            <Upload
                              listType="picture"
                              maxCount={1}
                              accept=".jpeg, .jpg, .png, .svg, .gif, .bmp, image/jpeg, image/png, image/svg+xml"
                              beforeUpload={() => false}
                            >
                              <Button icon={<UploadOutlined />}>
                                {I18n.t('administration.projects.design_settings.logo_upload')}
                              </Button>
                            </Upload>
                            {idp?.clientLogo && <Image className="mt-4" height={100} src={idp?.clientLogo} />}
                          </Form.Item>
                          {idp?.clientLogo && (
                            <Form.Item
                              name="removeClientLogo"
                              valuePropName="checked"
                              noStyle
                            >
                              <Checkbox disabled={!idp?.clientLogo}>
                                {I18n.t('administration.idp.remove')}
                              </Checkbox>
                            </Form.Item>
                          )}
                        </Card>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="titleText" label={I18n.t('administration.idp.title_text')}>
                          <Input />
                        </Form.Item>
                        <Form.Item name="subtitleText" label={I18n.t('administration.idp.subtitle_text')}>
                          <Input />
                        </Form.Item>

                        <Form.Item name="fields" label={I18n.t('administration.idp.fields_label')}>
                          <Checkbox.Group>
                            <Row>
                              {FIELDS.map(field => (
                                <Col xs={12} key={field}>
                                  <Checkbox value={field}>
                                    {I18n.t(`administration.idp.fields.${field}`)}
                                  </Checkbox>
                                </Col>
                              ))}
                            </Row>
                          </Checkbox.Group>
                        </Form.Item>
                        <Form.Item name="showReflections" valuePropName="checked">
                          <Checkbox>
                            {I18n.t('administration.idp.show_reflections')}
                          </Checkbox>
                        </Form.Item>
                      </Col>
                    </Row>
                  ),
                },
              ]}
            />
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default IDPTemplateForm
