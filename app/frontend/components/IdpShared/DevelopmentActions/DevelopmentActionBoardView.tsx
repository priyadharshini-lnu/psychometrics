import React, { useMemo } from 'react'
import {
  Avatar, Collapse, Empty, Flex,
} from 'antd'
import { DevelopmentActionPortraitCard } from './DevelopmentActionPortraitCard'
import styles from './DevelopmentActionBoardView.less'
import { CategoryWithDevelopmentActions, DevelopmentActionWithSkill } from './Types'
import { renderSkillCategoryIcon } from '../utils'

const { I18n } = window
interface SkillsContainerProps {
  developmentActionTypes: CategoryWithDevelopmentActions[];
}

export const DevelopmentActionBoardView: React.FC<SkillsContainerProps> = ({ developmentActionTypes }) => {
  const renderPortraitSkillCards = (skills: DevelopmentActionWithSkill[]) => {
    if (skills.length === 0) return <span>{I18n.t('idp.development_actions.no_development_actions')}</span>
    return skills.map(skill => (
      <DevelopmentActionPortraitCard key={skill.id} {...skill} />
    ))
  }

  const renderSkillBoards = (skills: DevelopmentActionWithSkill[]) => {
    const notStarted: DevelopmentActionWithSkill[] = []
    const inProgress: DevelopmentActionWithSkill[] = []
    const completed: DevelopmentActionWithSkill[] = []

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

  const items = useMemo(() => developmentActionTypes.map(type => ({
    key: type.developmentActionType,
    label: (
      <Flex align="center" gap={12}>
        <Avatar size={24} src={renderSkillCategoryIcon(type.developmentActionType)} />
        <h3 className={styles.h3}>{type.developmentActionType}</h3>
      </Flex>),
    children: renderSkillBoards(type.developmentActions),
  })), [developmentActionTypes])

  const activeKeys = useMemo(
    () => developmentActionTypes.map(category => category.developmentActionType),
    [developmentActionTypes],
  )

  return (
    <Flex gap={12}>
      {items && items.length > 0
        ? (<Collapse defaultActiveKey={activeKeys} ghost items={items} accordion />) : <Empty />}
    </Flex>
  )
}
