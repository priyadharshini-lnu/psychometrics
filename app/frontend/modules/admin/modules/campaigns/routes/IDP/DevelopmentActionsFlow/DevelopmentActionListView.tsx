import { useState } from 'react'
import {
  Avatar, Button, Flex, Typography, Empty,
} from 'antd'
import { map, filter, sortBy } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { useMedia } from 'use-media'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Separator } from '~/components/IdpShared/Separator'
import { DevelopmentActionLandscapeCard } from './DevelopmentActionLandscapeCard'
import {
  TypeWithSkills,
  DevelopmentAction,
  DevelopmentActionLearningStyle,
  SkillWithDevelopmentActions,
} from '~/components/IdpShared/DevelopmentActions/Types'
import { CreateCustomDevelopmentActionModal } from
  '~/components/IdpShared/DevelopmentActions/CreateCustomDevelopmentActionModal'
import { AddDevelopmentActionModal } from '~/components/IdpShared/DevelopmentActions/AddDevelopmentActionModal'
import { AIGeneratedDevelopmentActions } from './AIGeneratedDevelopmentActions'
import { renderSkillTypeIcon } from '~/components/IdpShared/utils'
import { DevelopmentActionSourceType } from '~/components/IdpShared/DevelopmentActions/Constants'
import styles from './DevelopmentActionListView.less'

const { I18n } = window

type DevelopmentActionListViewProps = {
  editMode?: boolean
  categories: TypeWithSkills[]
  availableDevelopmentActions: DevelopmentAction[]
  onAddDevelopmentAction?: (developmentAction: Record<string, DevelopmentAction>) => void
  onShowAvailableDevelopmentAction?: (skillId: number | string | null) => void
  onUpdateDevelopmentAction?: (developmentAction: Partial<DevelopmentAction>) => void
  onAddMoreSkills: () => void;
  onRemoveDevelopmentAction: (developmentAction: DevelopmentAction) => void
  onRemoveSkill: (skillId:number) => void
  aiAssistantsEnabled: boolean
}

export const DevelopmentActionListView: React.FC<DevelopmentActionListViewProps> = ({
  categories,
  editMode,
  availableDevelopmentActions,
  onAddDevelopmentAction,
  onAddMoreSkills,
  onShowAvailableDevelopmentAction,
  onRemoveDevelopmentAction,
  onUpdateDevelopmentAction,
  onRemoveSkill,
  aiAssistantsEnabled,
}) => {
  const [isAddDevelopmentActionModalOpen, setIsAddDevelopmentActionModalOpen] = useState(false)
  const [isAIGeneratedDevelopmentActionsModalOpen, setIsAIGeneratedDevelopmentActionsModalOpen] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<SkillWithDevelopmentActions | null>(null)
  const [isCreateCustomDevelopmentActionModalOpen, setIsCreateCustomDevelopmentActionModalOpen] = useState(false)
  const isTablet = useMedia({
    maxWidth: 768,
  })

  const selectedDevelopmentActionIds = map(
    filter(selectedSkill?.developmentActions ?? [], 'developmentActionId'),
    'developmentActionId',
  )

  const selectedAIGeneratedDevelopmentActions = filter(selectedSkill?.developmentActions ?? [],
    'customAction')

  const handleCancel = () => {
    setIsAddDevelopmentActionModalOpen(false)
    setIsCreateCustomDevelopmentActionModalOpen(false)
  }

  const handleShowAvailableDevelopmentAction = (skill: SkillWithDevelopmentActions) => {
    setIsAddDevelopmentActionModalOpen(true)
    onShowAvailableDevelopmentAction?.(skill.skillId)
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
          sourceType: DevelopmentActionSourceType.PLATFORM,
          userIdpSkillId: selectedSkill.id,
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

  const handleAddAIGeneratedDevelopmentAction = (developmentActions) => {
    onAddDevelopmentAction?.(developmentActions.reduce((acc, developmentAction) => {
      const uniqueId = uuidv4()
      acc[uniqueId] = {
        ...developmentAction,
        id: uniqueId,
        sourceType: DevelopmentActionSourceType.AI_GENERATED,
        developmentActionId: developmentAction.id,
        userIdpSkillId: selectedSkill?.id,
        progress: 0,
        private: false,
        localData: true,
      }
      return acc
      // Flag to add data in redux store with ID and remove ID when we send data to backend
    }, {}))
    setIsAddDevelopmentActionModalOpen(false)
    setIsAIGeneratedDevelopmentActionsModalOpen(false)
  }

  const handleShowCustomDevelopmentAction = (skill) => {
    setSelectedSkill(skill)
    setIsCreateCustomDevelopmentActionModalOpen(true)
    setIsAddDevelopmentActionModalOpen(false)
  }

  const handleShowAIGeneratedDevelopmentActions = (skill) => {
    setSelectedSkill(skill)
    setIsAIGeneratedDevelopmentActionsModalOpen(true)
  }

  const renderCards = (skills: SkillWithDevelopmentActions[]) => {
    if (skills.length === 0) return <span>{I18n.t('idp.development_actions.no_development_actions')}</span>
    return skills.filter(skill => !skill.private).map(skill => (
      <DevelopmentActionLandscapeCard
        key={skill.id}
        editMode={editMode}
        onAddDevelopmentAction={() => handleShowAvailableDevelopmentAction(skill)}
        onShowCustomDevelopmentAction={() => handleShowCustomDevelopmentAction(skill)}
        onShowAIGeneratedDevelopmentActions={() => { handleShowAIGeneratedDevelopmentActions(skill) }}
        onRemoveDevelopmentAction={onRemoveDevelopmentAction}
        onUpdateDevelopmentAction={onUpdateDevelopmentAction}
        developmentActions={skill.developmentActions}
        name={skill.name}
        userIdpSkillId={skill.id as number}
        onRemoveSkill={onRemoveSkill}
        aiAssistantsEnabled={aiAssistantsEnabled}
      />
    ))
  }

  return (
    <>
      {!isTablet ? (
        <Flex vertical gap={4} className="pt-2">
          <Flex
            flex={1}
            justify="space-between"
            align="center"
          >
            <Flex flex={1}>
              <Typography.Text className="font-semi-bold">
                {I18n.t('admin.idp_development_actions_heading')}
              </Typography.Text>
            </Flex>
            <Flex flex={1}>
              <Flex
                flex={1}
                className="ms-4"
              >
                <Typography.Text className="font-semi-bold">
                  {I18n.t('admin.idp_development_actions_date_range')}
                </Typography.Text>
              </Flex>
              <Flex
                flex={1}
                className="ms-4"
              >
                <Typography.Text className="font-semi-bold">
                  {I18n.t('admin.idp_development_actions_completion')}
                </Typography.Text>
              </Flex>
            </Flex>
          </Flex>
          <Separator
            className="mb-0 mt-1"
          />
        </Flex>
      ) : null}
      <Flex vertical gap={12}>
        {categories.length === 0 && (
          <Flex justify="center" align="center" className="p-4 mt-2">
            <Empty description="" style={{ marginLeft: '-2rem' }} />
            <Flex vertical align="start" style={{ marginLeft: '-2rem' }}>
              <>
                {' '}
                <strong className="ta-s">
                  {I18n.t('idp.no_skills_added')}
                </strong>
                <Typography.Text type="secondary" className="ta-s">
                  {I18n.t('idp.edit_plan_and_add_skills')}
                </Typography.Text>
              </>
            </Flex>
          </Flex>
        )}
        {sortBy(categories, 'skillType').map(category => (
          <div key={category.skillType} className="pt-4 pb-4 mt-2">
            <Flex vertical gap={16}>
              <Flex align="center" gap={8}>
                <Avatar size={64} src={renderSkillTypeIcon(category.skillType)} />
                <Typography.Title
                  className="font-semi-bold m-0 mb-0 transform-capitalize"
                  level={3}
                >
                  {category.skillType}
                </Typography.Title>
              </Flex>
              <Flex gap={12} vertical>
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
            {I18n.t('idp.initial_steps.add_skills_step')}
          </Button>
        ) : null}
      </Flex>
      <AddDevelopmentActionModal
        data={availableDevelopmentActions}
        onAddAction={handleAddDevelopmentAction}
        onCancel={handleCancel}
        open={isAddDevelopmentActionModalOpen}
        selectedDevelopmentActionIds={selectedDevelopmentActionIds.map(id => Number(id))}
        skillName={selectedSkill?.name as string}
      />
      <CreateCustomDevelopmentActionModal
        open={isCreateCustomDevelopmentActionModalOpen}
        onCreateCustomDevelopmentAction={handleCreateCustomDevelopmentAction}
        onCancel={handleCancel}
        skillName={selectedSkill?.name as string}
      />
      {aiAssistantsEnabled && (
        <AIGeneratedDevelopmentActions
          open={isAIGeneratedDevelopmentActionsModalOpen}
          onCancel={() => setIsAIGeneratedDevelopmentActionsModalOpen(false)}
          skill={selectedSkill as SkillWithDevelopmentActions}
          onAddDevelopmentAction={handleAddAIGeneratedDevelopmentAction}
          selectedAIGeneratedDevelopmentActions={selectedAIGeneratedDevelopmentActions as DevelopmentAction[]}
        />
      )}
    </>
  )
}
