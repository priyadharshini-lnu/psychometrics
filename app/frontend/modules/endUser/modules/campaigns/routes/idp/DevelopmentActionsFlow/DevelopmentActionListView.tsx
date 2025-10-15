import React, { useState, useContext } from 'react'
import {
  Avatar, Button, Flex, Typography, Empty,
} from 'antd'
import { map, filter } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MediaQueryContext } from '~/glint'
import { Separator } from '~/components/IdpShared/Separator'
import { DevelopmentActionLandscapeCard } from './DevelopmentActionLandscapeCard'
import {
  TypeWithSkills,
  DevelopmentAction,
  DevelopmentActionLearningStyle,
  SkillWithDevelopmentActions,
} from '~/components/IdpShared/DevelopmentActions/Types'
import { CreateCustomDevelopmentActionModal }
  from '~/components/IdpShared/DevelopmentActions/CreateCustomDevelopmentActionModal'
import { AddDevelopmentActionModal } from '~/components/IdpShared/DevelopmentActions/AddDevelopmentActionModal'
import styles from './DevelopmentActionListView.less'
import { AIGeneratedDevelopmentActionsModal } from './AIGeneratedDevelopmentActionsModal'
import { renderSkillTypeIcon } from '~/components/IdpShared/utils'
import { DevelopmentActionSourceType } from '~/components/IdpShared/DevelopmentActions/Constants'

const { I18n } = window

type SkillsContainerProps = {
  editMode?: boolean
  categories: TypeWithSkills[]
  availableDevelopmentActions: DevelopmentAction[]
  onAddDevelopmentAction?: (developmentAction: Record<string, DevelopmentAction>) => void
  onShowAvailableDevelopmentAction?: (skillId: string | number | null) => void
  onUpdateDevelopmentActionProgress?: (developmentAction: Pick<DevelopmentAction, 'id'| 'progress'>) => void
  onUpdateDevelopmentAction?: (developmentAction: Partial<DevelopmentAction>) => void
  onAddMoreSkills: () => void;
  isDALoading: boolean;
  isViewingReportee?:boolean
  setSkillForComment: (skillDetails: { skillId: string; skillName: string; } | null) => void
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
  isDALoading,
  isViewingReportee = false,
  setSkillForComment,
}) => {
  const [isAddDevelopmentActionModalOpen, setIsAddDevelopmentActionModalOpen] = useState(false)
  const [isAIGeneratedDevelopmentActionsModalOpen, setIsAIGeneratedDevelopmentActionsModalOpen] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<SkillWithDevelopmentActions | null>(null)
  const [isCreateCustomDevelopmentActionModalOpen, setIsCreateCustomDevelopmentActionModalOpen] = useState(false)

  const { isMobile, isTablet, isDesktop } = useContext(MediaQueryContext)


  const selectedDevelopmentActionIds = map(
    filter(selectedSkill?.developmentActions ?? [], 'developmentActionId'),
    'developmentActionId',
  )

  // TODO: Use AI related flag here
  const selectedAIGeneratedDevelopmentActions: Partial<DevelopmentAction>[] = filter(
    selectedSkill?.developmentActions ?? [],
    'customAction',
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

  const handleAddDevelopmentAction = (developmentActions: DevelopmentAction[]) => {
    if (selectedSkill) {
      onAddDevelopmentAction?.(developmentActions.reduce((acc, developmentAction) => {
        const uniqueId = uuidv4()
        acc[uniqueId] = {
          ...developmentAction,
          id: uniqueId,
          developmentActionId: developmentAction.id,
          userIdpSkillId: selectedSkill.id,
          sourceType: DevelopmentActionSourceType.PLATFORM,
          progress: 0,
          private: false,
          localData: true,
        }
        return acc
        // Flag to add data in redux store with ID and remove ID when we send data to backend
      }, {}))
    }
    setIsAddDevelopmentActionModalOpen(false)
    setSelectedSkill(null)
  }

  const handleCreateCustomDevelopmentAction = (
    name: string,
    description: string,
    learningStyle: DevelopmentActionLearningStyle,
  ) => {
    if (selectedSkill) {
      const uniqueId = uuidv4()
      const action = {}
      action[uniqueId] = {
        name,
        description,
        learningStyle,
        sourceType: DevelopmentActionSourceType.CUSTOM,
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

  const handleAddAIGeneratedDevelopmentAction = (developmentActions: DevelopmentAction[]) => {
    onAddDevelopmentAction?.(developmentActions.reduce((acc, developmentAction) => {
      const uniqueId = uuidv4()
      acc[uniqueId] = {
        ...developmentAction,
        sourceType: DevelopmentActionSourceType.AI_GENERATED,
        id: uniqueId,
        developmentActionId: developmentAction.id,
        userIdpSkillId: selectedSkill?.id,
        progress: 0,
        private: false,
        localData: true,
      }
      return acc
      // Flag to add data in redux store with ID and remove ID when we send data to backend
    }, {}))
    setIsAIGeneratedDevelopmentActionsModalOpen(false)
  }

  const handleShowCustomDevelopmentAction = (skill) => {
    setSelectedSkill(skill)
    setIsCreateCustomDevelopmentActionModalOpen(true)
  }

  const handleShowAIGeneratedDevelopmentActions = (skill) => {
    setSelectedSkill(skill)
    setIsAIGeneratedDevelopmentActionsModalOpen(true)
  }

  const renderCards = (skills: SkillWithDevelopmentActions[]) => {
    if (skills.length === 0) return <span>{I18n.t('idp.development_actions.no_development_actions')}</span>
    return skills.map(skill => (
      <DevelopmentActionLandscapeCard
        key={skill.id}
        editMode={editMode}
        onAddDevelopmentAction={() => handleShowAvailableDevelopmentAction(skill)}
        onShowCustomDevelopmentAction={() => handleShowCustomDevelopmentAction(skill)}
        onShowAIGeneratedDevelopmentActions={() => { handleShowAIGeneratedDevelopmentActions(skill) }}
        onUpdateDevelopmentAction={onUpdateDevelopmentAction}
        onUpdateDevelopmentActionProgress={onUpdateDevelopmentActionProgress}
        userIdpSkillId={skill.id as number}
        isPrivate={skill.private}
        setSkillForComment={setSkillForComment}
        {...skill}
      />
    ))
  }

  return (
    <>
      {!(isTablet || isDesktop) && categories.length ? (
        <Flex vertical gap={4} className="ps-8 pe-8 pt-4">
          <Flex
            flex={1}
            justify="space-between"
            align="center"
          >
            <Flex flex={1}>
              <Typography.Text className="font-semi-bold">
                {I18n.t('idp.development_actions.heading')}
              </Typography.Text>
            </Flex>
            <Flex flex={1}>
              <Flex flex={1} className="ms-2">
                <Typography.Text className="font-semi-bold">
                  {I18n.t('idp.development_actions.date_range')}
                </Typography.Text>
              </Flex>
              <Flex flex={1} className="ms-4">
                <Typography.Text className="font-semi-bold">
                  {I18n.t('idp.development_actions.completion')}
                </Typography.Text>
              </Flex>
            </Flex>
          </Flex>
          <Separator
            className="mb-0 mt-1"
          />
        </Flex>
      ) : null}
      <Flex vertical gap={8} className={isMobile ? '' : 'ps-8 pe-8 pt-2'}>
        {categories.length === 0 && (
          <Flex justify="center" align="center" className="p-4 mt-2">
            <Empty description="" style={{ marginLeft: '-2rem' }} />
            <Flex vertical align="start" style={{ marginLeft: '-2rem' }}>
              {isViewingReportee ? (
                <strong className="ta-s">
                  {I18n.t('idp.no_skills_added_by_reportee')}
                </strong>
              ) : (
                <>
                  {' '}
                  <strong className="ta-s">
                    {I18n.t('idp.no_skills_added')}
                  </strong>
                  <Typography.Text type="secondary" className="ta-s">
                    {I18n.t('idp.edit_plan_and_add_skills')}
                  </Typography.Text>
                </>
              )}
            </Flex>
          </Flex>
        )}
        {categories.map(category => (
          <div key={category.skillType} className="mt-2">
            <Flex vertical gap={4}>
              <Flex align="center" gap={12}>
                <Avatar size={24} src={renderSkillTypeIcon(category.skillType)} />
                <Typography.Title
                  className="font-semi-bold m-0 mb-0 transform-capitalize"
                  level={3}
                >
                  {I18n.t(`idp.${category.skillType.toLowerCase()}`)}
                </Typography.Title>
              </Flex>
              <Flex vertical>
                {renderCards(category.skills)}
              </Flex>
            </Flex>
          </div>
        ))}
        {editMode ? (
          <Button
            onClick={() => onAddMoreSkills()}
            icon={<PlusOutlined />}
            className={styles.manageSkillsBtn}
          >
            {I18n.t('idp.development_actions.manage_skills')}
          </Button>
        ) : null}
      </Flex>
      <AddDevelopmentActionModal
        data={availableDevelopmentActions}
        onAddAction={handleAddDevelopmentAction}
        onCancel={handleCancel}
        skillName={selectedSkill?.name as string}
        open={isAddDevelopmentActionModalOpen}
        selectedDevelopmentActionIds={selectedDevelopmentActionIds as (string | number)[]}
        isDALoading={isDALoading}
        wrapClassName={styles.developmentActionModal}
      />
      <CreateCustomDevelopmentActionModal
        open={isCreateCustomDevelopmentActionModalOpen}
        onCreateCustomDevelopmentAction={handleCreateCustomDevelopmentAction}
        onCancel={handleCancel}
        skillName={selectedSkill?.name as string}
        wrapClassName={styles.developmentActionModal}
      />
      <AIGeneratedDevelopmentActionsModal
        open={isAIGeneratedDevelopmentActionsModalOpen}
        onCancel={() => setIsAIGeneratedDevelopmentActionsModalOpen(false)}
        skill={selectedSkill}
        onAddDevelopmentAction={handleAddAIGeneratedDevelopmentAction}
        selectedAIGeneratedDevelopmentActions={selectedAIGeneratedDevelopmentActions}
        wrapClassName={styles.developmentActionModal}
      />
    </>

  )
}
