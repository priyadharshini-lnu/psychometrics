import { FC } from 'react'
import {
  Card, Tag, Space, theme, Empty,
} from 'antd'

type Skill = {
  id: number
  name: string
}

type Props = {
  selectedSkills: Skill[]
  OnRemoveSkill: (id: number) => void
}

const { I18n } = window
const { useToken } = theme

export const SelectedSkillsCard: FC<Props> = ({ selectedSkills, OnRemoveSkill }) => {
  const { token } = useToken()
  return (
    <Card
      title={`${I18n.t('idp.initial_steps.selected_skills')} (${selectedSkills.length})`}
    >
      {selectedSkills.length ? (
        <Space direction="vertical">
          {
          selectedSkills.map(skill => (
            <Tag color={token.colorPrimaryActive} closable onClose={() => OnRemoveSkill(skill.id)}>{skill.name}</Tag>
          ))
        }
        </Space>
      ) : <Empty description={I18n.t('idp.initial_steps.no_skills_selected')} />}
    </Card>
  )
}
