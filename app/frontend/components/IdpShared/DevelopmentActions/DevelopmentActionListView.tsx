import React, { useState } from 'react'
import {
  Avatar, Flex, Modal, Typography,
} from 'antd'
import { DevelopmentActionLandscapeCard } from './DevelopmentActionLandscapeCard'
import { BoxWithShadow } from '~/glint'

import styles from './DevelopmentActionListView.less'
import AddDevelopmentAction from './AddDevelopmentAction'

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
  onAddDevelopmentAction?: () => void;
}

export const DevelopmentActionListView: React.FC<SkillsContainerProps> = ({
  categories,
  onAddDevelopmentAction,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const handleOk = () => {
  }

  const handleCancel = () => {
    onAddDevelopmentAction?.()
    setIsModalOpen(false)
  }

  const handleAddDevelopmentAction = () => {
    setIsModalOpen(true)
  }

  const renderCards = (skills: Skill[]) => {
    if (skills.length === 0) return <span>{I18n.t('idp.development_actions.no_development_actions')}</span>
    return skills.map(skill => (
      <DevelopmentActionLandscapeCard
        key={skill.id}
        handleAddDevelopmentAction={handleAddDevelopmentAction}
        {...skill}
      />
    ))
  }

  return (
    <>
      <BoxWithShadow className={`${styles.mt_8} ${styles.px_16}`}>
        <Flex
          align="stretch"
        >
          <Flex
            vertical
            flex={5}
            className={`${styles.borderWithPadding} ${styles.pl_none}`}
          >
            <Typography.Text>
              {I18n.t('idp.development_actions.development_actions')}
            </Typography.Text>
          </Flex>
          <Flex flex={5}>
            <Flex
              flex={4}
              className={styles.borderWithPadding}
            >
              <Typography.Text>
                {I18n.t('idp.development_actions.date_range')}
              </Typography.Text>
            </Flex>
            <Flex
              flex={3}
              className={styles.borderWithPadding}
            >
              <Typography.Text>
                {I18n.t('idp.development_actions.private')}
              </Typography.Text>
            </Flex>
            <Flex
              flex={6}
              className={styles.borderWithPadding}
            >
              <Typography.Text>
                {I18n.t('idp.development_actions.completion')}
              </Typography.Text>
            </Flex>
          </Flex>
        </Flex>
      </BoxWithShadow>
      <Flex vertical gap={12}>
        {categories.map(category => (
          <BoxWithShadow className={`${styles.p_16} ${styles.mt_8}`}>
            <Flex key={category.id} vertical gap={16}>
              <Flex align="center" gap={12}>
                <Avatar size={24} />
                <h3 className={styles.h3}>{category.category}</h3>
              </Flex>
              <Flex gap={12} vertical>
                {renderCards(category.skills)}
              </Flex>
            </Flex>
          </BoxWithShadow>
        ))}
      </Flex>
      <Modal
        title={I18n.t('idp.development_actions.development_actions')}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={800}
        className={styles.modal}
      >
        <AddDevelopmentAction skills={categories[0].skills} onAddAction={handleAddDevelopmentAction} />
      </Modal>
    </>

  )
}
