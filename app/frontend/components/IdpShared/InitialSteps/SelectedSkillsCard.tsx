import { FC } from 'react'
import {
  Card, Tag, Space, theme, Empty,
} from 'antd'

import { UserIdpSkill } from '../DevelopmentActions'

type Props = {
  selectedSkills: (UserIdpSkill)[]
  onRemoveSkill: (skillId: number) => void
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
          selectedSkills.map(userIdpSkill => (
            <Tag
              key={userIdpSkill.skillId}
              color={token.colorPrimaryActive}
              closable
              onClose={() => onRemoveSkill(userIdpSkill.skillId)}
            >
              {userIdpSkill.name}
            </Tag>
          ))
        }
        </Space>
      ) : <Empty description={I18n.t('idp.initial_steps.no_skills_selected')} />}
    </Card>
  )
}
