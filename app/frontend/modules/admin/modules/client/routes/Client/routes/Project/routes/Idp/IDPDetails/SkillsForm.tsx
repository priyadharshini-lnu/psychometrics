import {
  Form, Card, Col, Row, Button, message, Space,
} from 'antd'
import _ from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { LoadingOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import SkillsAndTagsSelection, { SkillsOption } from './SkillsAndTagsSelection'
import { Idp, IdpTR, Skill } from '~/modules/admin/modules/client/core/idp'

const { I18n } = window

export type CategorizedSkills = {
  behavioralGlobalSkills: Skill[],
  behavioralClientSkills: Skill[],
  technicalGlobalSkills: Skill[],
  technicalClientSkills: Skill[],
}

type SkillsFormProps = {
  idp: Idp,
  fetch: () => void,
}

const SkillsForm = ({
  idp, fetch,
}: SkillsFormProps) => {
  const { projectId } = useParams() as { projectId: string }

  const globalSkillsEnabled = idp?.meta?.projectFeatures?.globalSkills || false

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

  const { updateResource } = useResources<Idp>('idp_templates', baseApiConfig)


  const [form] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)
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

      const skillArrays = [
        values.behavioralClientSkills || [],
        values.technicalClientSkills || [],
      ]

      if (globalSkillsEnabled) {
        skillArrays.push(values.behavioralGlobalSkills || [])
        skillArrays.push(values.technicalGlobalSkills || [])
      }

      const skills: Pick<Skill, 'id'>[] = _.flatten(skillArrays).map((skill: string) => ({ id: skill }))

      const payload = {
        skills,
        behaviouralGlobalTags: globalSkillsEnabled ? (values.behavioralGlobalTags || []) : [],
        behaviouralClientTags: values.behavioralClientTags || [],
        technicalGlobalTags: globalSkillsEnabled ? (values.technicalGlobalTags || []) : [],
        technicalClientTags: values.technicalClientTags || [],
        behavioralGlobalSkillSettings: globalSkillsEnabled ? values.behavioralGlobalSkillSettings : SkillsOption.NONE,
        behavioralClientSkillSettings: values.behavioralClientSkillSettings,
        technicalGlobalSkillSettings: globalSkillsEnabled ? values.technicalGlobalSkillSettings : SkillsOption.NONE,
        technicalClientSkillSettings: values.technicalClientSkillSettings,
        project: { id: projectId, type: 'projects' },
      }

      try {
        await updateResource({ id: idp.id, ...payload })
        message.success(I18n.t('admin.idp_skills_updated'))
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
      behavioralGlobalSkillSettings: SkillsOption.NONE,
      behavioralClientSkillSettings: SkillsOption.NONE,
      technicalGlobalSkillSettings: SkillsOption.NONE,
      technicalClientSkillSettings: SkillsOption.NONE,
    }
  }, [idp])

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
    >
      <Space orientation="vertical" className="w-100">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={24}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Card title={I18n.t('admin.idp_behavioral_skills')}>
                  {globalSkillsEnabled && (
                    <SkillsAndTagsSelection
                      categorizedSkills={categorizedSkills}
                      skillType="behavioral"
                      type="Global"
                      projectId={projectId}
                      form={form}
                    />
                  )}
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
                <Card title={I18n.t('admin.idp_technical_skills')}>
                  {globalSkillsEnabled && (
                    <SkillsAndTagsSelection
                      categorizedSkills={categorizedSkills}
                      skillType="technical"
                      type="Global"
                      projectId={projectId}
                      form={form}
                    />
                  )}
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
          </Col>
        </Row>
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
        >
          {isLoading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('shared.update')}
        </Button>
      </Space>
    </Form>
  )
}

export default SkillsForm
