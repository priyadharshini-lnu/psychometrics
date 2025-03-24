import React, { useState } from 'react'
import {
  Avatar, Button, Flex, Typography, Divider,
} from 'antd'
import _ from 'lodash'
import { EditOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { useMedia } from 'use-media'
import { DevelopmentActionLandscapeCard } from './DevelopmentActionLandscapeCard'
import { BoxWithShadow } from '~/glint'
import {
  AvailableDevelopmentActions, CategoryWithSkills, DevelopmentAction, SkillWithDevelopmentActions,
} from '.'
import { CreateCustomDevelopmentActionModal } from './CreateCustomDevelopmentActionModal'
import { AddDevelopmentActionModal } from './AddDevelopmentActionModal'
import styles from './DevelopmentActionListView.less'
import { AIGeneratedDevelopmentActionsModal } from './AIGeneratedDevelopmentActionsModal'
import { renderSkillCategoryIcon } from '../utils'

const { I18n } = window

type SkillsContainerProps = {
  editMode?: boolean
  categories: CategoryWithSkills[]
  availableDevelopmentActions: AvailableDevelopmentActions[]
  onAddDevelopmentAction?: (developmentAction: Partial<DevelopmentAction>) => void
  onShowAvailableDevelopmentAction?: (skillId: number | null) => void
  onUpdateDevelopmentActionProgress?: (developmentAction: Pick<DevelopmentAction, 'id'| 'progress'>) => void
  onUpdateDevelopmentAction?: (developmentAction: Partial<DevelopmentAction>) => void
  onAddMoreSkills: (category: CategoryWithSkills) => void;
}

export const DevelopmentActionListView: React.FC<SkillsContainerProps> = ({
  categories,
  editMode,
  availableDevelopmentActions,
  onAddDevelopmentAction,
  onAddMoreSkills,
  onShowAvailableDevelopmentAction,
  onUpdateDevelopmentAction,
  onUpdateDevelopmentActionProgress,
}) => {
  const [isAddDevelopmentActionModalOpen, setIsAddDevelopmentActionModalOpen] = useState(false)
  const [isAIGeneratedDevelopmentActionsModalOpen, setIsAIGeneratedDevelopmentActionsModalOpen] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<SkillWithDevelopmentActions | null>(null)
  const [isCreateCustomDevelopmentActionModalOpen, setIsCreateCustomDevelopmentActionModalOpen] = useState(false)
  const isTablet = useMedia({
    maxWidth: 768,
  })

  const selectedDevelopmentActionIds = _.map(
    _.filter(selectedSkill?.developmentActions ?? [], 'developmentActionId'),
    'developmentActionId',
  )

  const handleCancel = () => {
    setIsAddDevelopmentActionModalOpen(false)
    setIsCreateCustomDevelopmentActionModalOpen(false)
  }

  const handleShowAvailableDevelopmentAction = (skill: SkillWithDevelopmentActions) => {
    setIsAddDevelopmentActionModalOpen(true)
    onShowAvailableDevelopmentAction?.(skill.id)
    setSelectedSkill(skill)
  }

  const handleAddDevelopmentAction = (developmentAction: Partial<DevelopmentAction>) => {
    if (selectedSkill) {
      const uniqueId = uuidv4()
      const action = {
        ...developmentAction,
        id: uniqueId,
        developmentActionId: developmentAction.id,
        userIdpSkillId: selectedSkill.id,
        progress: 0,
        private: false,
        localData: true, // Flag to add data in redux store with ID and remove ID when we send data to backend
      }
      onAddDevelopmentAction?.(action)
    }
    setIsAddDevelopmentActionModalOpen(false)
    setSelectedSkill(null)
  }

  const handleCreateCustomDevelopmentAction = (customAction: string) => {
    if (selectedSkill) {
      const uniqueId = uuidv4()
      const action = {
        customAction,
        id: uniqueId,
        userIdpSkillId: selectedSkill.id,
        progress: 0,
        private: false,
        localData: true, // Flag to add data in redux store with ID and remove ID when we send data to backend
      }
      onAddDevelopmentAction?.(action)
    }
    setIsCreateCustomDevelopmentActionModalOpen(false)
    setSelectedSkill(null)
  }

  const handleAddAIGeneratedDevelopmentAction = (developmentAction: Partial<DevelopmentAction>) => {
    if (developmentAction.description) {
      handleCreateCustomDevelopmentAction(developmentAction.description)
    }
    setIsAddDevelopmentActionModalOpen(false)
    setIsAIGeneratedDevelopmentActionsModalOpen(false)
  }

  const handleShowCustomDevelopmentAction = () => {
    setIsCreateCustomDevelopmentActionModalOpen(true)
    setIsAddDevelopmentActionModalOpen(false)
  }

  const renderCards = (skills: SkillWithDevelopmentActions[]) => {
    if (skills.length === 0) return <span>{I18n.t('idp.development_actions.no_development_actions')}</span>
    return skills.map(skill => (
      <DevelopmentActionLandscapeCard
        key={skill.id}
        editMode={editMode}
        onAddDevelopmentAction={() => handleShowAvailableDevelopmentAction(skill)}
        onUpdateDevelopmentAction={onUpdateDevelopmentAction}
        onUpdateDevelopmentActionProgress={onUpdateDevelopmentActionProgress}
        userIdpSkillId={skill.id}
        {...skill}
      />
    ))
  }

  return (
    <>
      {!isTablet ? (
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
                {I18n.t('idp.development_actions.heading')}
              </Typography.Text>
            </Flex>
            <Flex flex={5}>
              <Flex
                flex={9}
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
      ) : null}
      <Flex vertical gap={12}>
        {categories.map(category => (
          <BoxWithShadow key={category.category} className={`${styles.p_16} ${styles.mt_8}`}>
            <Flex vertical gap={16}>
              <Flex align="center" gap={12}>
                <Avatar size={24} src={renderSkillCategoryIcon(category.category)} />
                <h3 className={styles.h3}>{category.category}</h3>
              </Flex>
              <Flex gap={12} vertical>
                {renderCards(category.skills)}
              </Flex>
            </Flex>
            {editMode ? (
              <>
                <Divider className="mt-4" />
                <Button onClick={() => onAddMoreSkills(category)} icon={<EditOutlined />} className="ps-0" type="link">
                  {I18n.t('idp.development_actions.manage_skills')}
                </Button>
              </>
            ) : null}
          </BoxWithShadow>
        ))}
      </Flex>
      <AddDevelopmentActionModal
        data={availableDevelopmentActions}
        onAddAction={handleAddDevelopmentAction}
        onShowCustomDevelopmentAction={handleShowCustomDevelopmentAction}
        onCancel={handleCancel}
        open={isAddDevelopmentActionModalOpen}
        onShowAIGeneratedDevelopmentActions={() => setIsAIGeneratedDevelopmentActionsModalOpen(true)}
        selectedDevelopmentActionIds={selectedDevelopmentActionIds}
      />
      <CreateCustomDevelopmentActionModal
        open={isCreateCustomDevelopmentActionModalOpen}
        onCreateCustomDevelopmentAction={handleCreateCustomDevelopmentAction}
        onCancel={handleCancel}
      />
      <AIGeneratedDevelopmentActionsModal
        open={isAIGeneratedDevelopmentActionsModalOpen}
        onCancel={() => setIsAIGeneratedDevelopmentActionsModalOpen(false)}
        skill={selectedSkill}
        onAddDevelopmentAction={handleAddAIGeneratedDevelopmentAction}
      />
    </>

  )
}
