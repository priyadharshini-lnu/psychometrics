import { Tag } from 'antd'
import { DevelopmentActionLearningStyle } from '../Types'

type Props = {
  type: DevelopmentActionLearningStyle
}

const { I18n } = window
const Tags = ({ type }: Props) => {
  const tag = TagsData[type]
  return (
    <>
      <Tag color={tag.color}>{tag.text}</Tag>
      <Tag>{tag.duration}</Tag>
    </>
  )
}

const TagsData = {
  on_the_job: I18n.t('idp.development_actions.learning_on_the_job'),
  structured_learning: I18n.t('idp.development_actions.structured_learning'),
  learning_from_others: I18n.t('idp.development_actions.learning_from_others'),
}

export default Tags
