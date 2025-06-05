import {
  Form, Input, Switch, Card, Col, Row, Button, Modal, Select, Spin,
  Tabs, message, Tooltip,
} from 'antd'
import _ from 'lodash'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import {
  useCallback, useEffect, useMemo, useState,
} from 'react'
import { useResources } from '~/hooks/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource'
import SkillsAndTagsSelection, { SkillsOption } from './SkillsAndTagsSelection'
import {
  Idp, Skill, Report, ReportTR,
} from '~/modules/admin/modules/client/core/idp'
import { AppearanceTab } from './AppearanceTab'
import { ReflectionQuestionsTab } from './ReflectionQuestionsTab'

const { I18n } = window

export type CategorizedSkills = {
  behavioralGlobalSkills: Skill[],
  behavioralClientSkills: Skill[],
  technicalGlobalSkills: Skill[],
  technicalClientSkills: Skill[],
}

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
  const [activeTab, setActiveTab] = useState('skills')
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
        behaviouralClientTags: values.behavioralClientTags || [],
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
      if (skill.skillType === 'behavioral' && !skill.projectId) {
        acc.behavioralGlobalSkills.push(skill)
        skills.behavioralGlobalSkills.push(skill.id)
      } else if (skill.skillType === 'behavioral' && skill.projectId) {
        acc.behavioralClientSkills.push(skill)
        skills.behavioralClientSkills.push(skill.id)
      } else if (skill.skillType === 'technical' && !skill.projectId) {
        acc.technicalGlobalSkills.push(skill)
        skills.technicalGlobalSkills.push(skill.id)
      } else if (skill.skillType === 'technical' && skill.projectId) {
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
        activeTab !== 'reflection_questions' && (
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
          >
            {isLoading ? <LoadingOutlined /> : <CheckOutlined />}
            {I18n.t(idp ? 'common.actions.update' : 'common.actions.add')}
          </Button>
        ),
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
              activeKey={activeTab}
              onChange={setActiveTab}
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
                            skillType="behavioral"
                            type="Global"
                            form={form}
                          />
                          <SkillsAndTagsSelection
                            categorizedSkills={categorizedSkills}
                            skillType="behavioral"
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
                            skillType="technical"
                            type="Global"
                            form={form}
                          />
                          <SkillsAndTagsSelection
                            categorizedSkills={categorizedSkills}
                            skillType="technical"
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
                  children: <AppearanceTab idp={idp} />,
                },
                {
                  label: idp
                    ? I18n.t('administration.idp.reflection_questions')
                    : (
                      <Tooltip title={I18n.t('administration.idp.reflection_questions_hint')}>
                        {I18n.t('administration.idp.reflection_questions')}
                      </Tooltip>
                    ),
                  forceRender: true,
                  key: 'reflection_questions',
                  disabled: !idp,
                  children: <ReflectionQuestionsTab idp={idp} projectId={projectId} />,
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
