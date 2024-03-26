import React, { useMemo } from 'react'
import { Avatar, Collapse, Flex } from 'antd'
import { DevelopmentActionPortraitCard } from './DevelopmentActionPortraitCard'
import styles from './DevelopmentActionBoardView.less'

const { I18n } = window
export interface Skill {
  id: number;
  name: string;
  rating: number;
  description: string;
  durationType: string;
  durationNumber: number;
  progress: number;
  startDate: Date | string;
  endDate: Date | string;
  isPrivate?: boolean;
}
interface Category {
  id: number;
  category: string;
  skills: Skill[];
}

interface SkillsContainerProps {
  categories: Category[];
}

export const DevelopmentActionBoardView: React.FC<SkillsContainerProps> = ({ categories }) => {
  const renderPortraitSkillCards = (skills: Skill[]) => {
    if (skills.length === 0) return <span>{I18n.t('idp.development_actions.no_development_actions')}</span>
    return skills.map(skill => (
      <DevelopmentActionPortraitCard key={skill.id} {...skill} />
    ))
  }

  const renderSkillBoards = (skills: Skill[]) => {
    const notStarted: Skill[] = []
    const inProgress: Skill[] = []
    const completed: Skill[] = []

    skills.forEach((skill) => {
      if (skill.progress === 0) {
        notStarted.push(skill)
      } else if (skill.progress > 0 && skill.progress < 100) {
        inProgress.push(skill)
      } else if (skill.progress === 100) {
        completed.push(skill)
      }
    })

    return (
      <Flex gap={24}>
        <Flex gap={12} vertical className={styles.column}>
          <h6 className={styles.h6}>{I18n.t('idp.development_actions.board_view.not_started')}</h6>
          <Flex gap={12} vertical className={styles.column_content}>
            {renderPortraitSkillCards(notStarted)}
          </Flex>
        </Flex>
        <Flex gap={12} vertical className={styles.column}>
          <h6 className={styles.h6}>{I18n.t('idp.development_actions.board_view.in_progress')}</h6>
          <Flex gap={12} vertical className={styles.column_content}>
            {renderPortraitSkillCards(inProgress)}
          </Flex>
        </Flex>
        <Flex gap={12} vertical className={styles.column}>
          <h6 className={styles.h6}>{I18n.t('idp.development_actions.board_view.completed')}</h6>
          <Flex gap={12} vertical className={styles.column_content}>
            {renderPortraitSkillCards(completed)}
          </Flex>
        </Flex>
      </Flex>
    )
  }

  const items = useMemo(() => categories.map(category => ({
    key: category.id.toString(),
    label: (
      <Flex align="center" gap={12}>
        <Avatar size={24} />
        <h3 className={styles.h3}>{category.category}</h3>
      </Flex>),
    children: renderSkillBoards(category.skills),
  })), [categories])


  return (
    <Flex gap={12}>
      <Collapse defaultActiveKey={['1']} ghost items={items} accordion />
    </Flex>
  )
}
