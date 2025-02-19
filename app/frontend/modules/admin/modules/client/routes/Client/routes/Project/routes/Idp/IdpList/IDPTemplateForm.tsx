import {
  Form, Input, Switch, Card, Col, Row, Button, Modal,
} from 'antd'
import _ from 'lodash'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useResourceContext } from '~/modules/admin/components/Resource'
import SkillsAndTagsSelection, { SkillsOption } from './SkillsAndTagsSelection'
import { Idp, Skill } from '~/modules/admin/modules/client/core/idp'

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
}

const IDPTemplateForm = ({ close, idp }: IDPTemplateFormProps) => {
  const { resource } = useResourceContext<Idp>()
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { projectId } = useParams() as { projectId: string }
  const [categorizedSkills, setCategorizedSkills] = useState<CategorizedSkills>({
    behavioralGlobalSkills: [],
    behavioralClientSkills: [],
    technicalGlobalSkills: [],
    technicalClientSkills: [],
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
      }

      if (idp) {
        await resource.updateResource({ id: idp.id, ...payload })
      } else {
        await resource.createResource(payload)
      }
      setIsModalVisible(false)
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
        ...skills,
      }
    }
    return {
      selfRatingEnabled: true,
      behavioralGlobalSkillSettings: SkillsOption.NONE,
      behavioralClientSkillSettings: SkillsOption.NONE,
      technicalGlobalSkillSettings: SkillsOption.NONE,
      technicalClientSkillSettings: SkillsOption.NONE,
    }
  }, [idp])

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

              <Form.Item name="selfRatingEnabled" label={I18n.t('administration.idp.self_rating')}>
                <Switch checkedChildren={I18n.t('yes')} unCheckedChildren={I18n.t('no')} />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={8}>
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
          <Col xs={24} md={8}>
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
      </Form>
    </Modal>
  )
}

export default IDPTemplateForm
