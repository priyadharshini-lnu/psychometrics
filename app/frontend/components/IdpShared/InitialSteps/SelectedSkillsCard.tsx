import { FC } from 'react'
import {
  Card, Tag, Space, theme, Empty,
} from 'antd'

import { UserIdpSkill, Skill } from '../DevelopmentActions'

type Props = {
  selectedSkills: (Skill | UserIdpSkill)[]
  onRemoveSkill: (id: number) => void
}

const { I18n } = window
const { useToken } = theme

export const SelectedSkillsCard: FC<Props> = ({ selectedSkills, onRemoveSkill }) => {
  const { token } = useToken()
  return (
    <Card
      title={`${I18n.t('idp.initial_steps.selected_skills')} (${selectedSkills.length})`}
    >
      {selectedSkills.length ? (
        <Space direction="vertical">
          {
          selectedSkills.map(skill => (
            <Tag
              key={skill.name}
              color={token.colorPrimaryActive}
              closable
              onClose={() => onRemoveSkill(skill.id)}
            >
              {skill.name}
            </Tag>
          ))
        }
        </Space>
      ) : <Empty description={I18n.t('idp.initial_steps.no_skills_selected')} />}
    </Card>
  )
}
