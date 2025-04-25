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
  on_the_job: {
    color: 'geekblue',
    text: I18n.t('idp.development_actions.marathon'),
    duration: 70,
  },
  structured_learning: {
    color: 'green',
    text: I18n.t('idp.development_actions.sprint'),
    duration: 20,
  },
  learning_from_others: {
    color: 'blue',
    text: I18n.t('idp.development_actions.other'),
    duration: 10,
  },
}

export default Tags
