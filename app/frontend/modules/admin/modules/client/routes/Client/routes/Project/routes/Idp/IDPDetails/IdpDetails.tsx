import { Tabs, Space, Skeleton } from 'antd'
import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LeftOutlined } from '@ant-design/icons'
import { Idp, IdpTR } from '~/modules/admin/modules/client/core/idp'
import { useResources } from '~/hooks/useResources/useResources'
import DetailsForm from './DetailsForm'
import SkillsForm from './SkillsForm'
import AppearanceForm from './AppearanceForm'
import IntroMessageForm from './IntroMessageForm'
import ReflectionQuestionsForm from './ReflectionQuestionsForm'
import InterviewQuestionsForm from './InterviewQuestionsForm'

const IdpDetails: React.FC = () => {
  const { projectId, id } = useParams() as { projectId: string, id: string }
  const navigate = useNavigate()

  const baseApiConfig = {
    basePath: `projects/${projectId}`,
    trackUrl: true,
    responseType: IdpTR,
    apiConfig: {
      fields: {
        skills: ['id', 'name', 'skill_type', 'project_id'],
      },
      include: ['skills', 'report', 'one_click_ai_assistant', 'document_analysis_ai_assistant'],
    },
  }

  const {
    data, fetchSingle,
  } = useResources<Idp>('idp_templates', baseApiConfig)

  const fetch = () => {
    fetchSingle({ id })
  }

  useEffect(() => {
    fetch()
  }, [])

  const idp = data[0]

  const onChange = (key: string) => {
    if (key === 'back') {
      navigate(`/admin/projects/${projectId}/idp/templates`)
    }
  }

  if (!idp) {
    return (
      <Skeleton />
    )
  }

  return (
    <div className="p-5">
      <Tabs
        defaultActiveKey="details"
        onTabClick={onChange}
        items={[
          {
            key: 'back',
            label: (
              <Space size={1}>
                <LeftOutlined />
                Back to List
              </Space>
            ),
            children: null,
          },
          {
            key: 'details',
            label: 'Details',
            children: <DetailsForm idp={idp} fetch={fetch} />,
          },
          {
            key: 'skills',
            label: 'Skills',
            children: <SkillsForm idp={idp} fetch={fetch} />,
          },
          {
            key: 'intro_message',
            label: 'Intro Message',
            children: <IntroMessageForm idp={idp} fetch={fetch} />,
          },
          {
            key: 'appearance',
            label: 'Appearance',
            children: <AppearanceForm idp={idp} fetch={fetch} />,
          },
          {
            key: 'reflective_questions',
            label: 'Reflective Questions',
            children: <ReflectionQuestionsForm idp={idp} fetch={fetch} />,
          },
          {
            key: 'interview_questions',
            label: 'Interview Questions',
            children: <InterviewQuestionsForm idp={idp} fetch={fetch} />,
          },
        ]}
      />
    </div>
  )
}

export default IdpDetails
