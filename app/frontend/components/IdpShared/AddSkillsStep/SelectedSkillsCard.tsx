import { FC } from 'react'
import {
  Card, Tag, Space, theme, Empty,
  Typography,
} from 'antd'
import { UserIdpSkill } from '../DevelopmentActions'

type Props = {
  selectedSkills: (UserIdpSkill)[]
  onRemoveSkill: (skillId: number) => void
}
const { Text } = Typography
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
              onClose={() => onRemoveSkill(userIdpSkill.skillId as number)}
              style={{ alignItems: 'center', display: 'flex', width: 'min-content' }}
            >
              <Text
                style={{ maxWidth: 150, color: 'inherit' }}
                ellipsis={{ tooltip: userIdpSkill.name }}
              >
                {userIdpSkill.name}
              </Text>
            </Tag>
          ))
        }
        </Space>
      ) : <Empty description={I18n.t('idp.initial_steps.no_skills_selected')} />}
    </Card>
  )
}
