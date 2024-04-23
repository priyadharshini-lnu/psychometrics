import React, { useState } from 'react'
import {
  Avatar, Button, Flex, Typography, Divider,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useMedia } from 'use-media'
import { DevelopmentActionLandscapeCard } from './DevelopmentActionLandscapeCard'
import { BoxWithShadow } from '~/glint'

import { AvailableDevelopmentActions, CategoryWithSkills, SkillWithDevelopmentActions } from '.'
import { CreateCustomDevelopmentActionModal } from './CreateCustomDevelopmentActionModal'
import { AddDevelopmentActionModal } from './AddDevelopmentActionModal'

import styles from './DevelopmentActionListView.less'

const { I18n } = window

type SkillsContainerProps = {
  editMode?: boolean;
  categories: CategoryWithSkills[];
  availableDevelopmentActions: AvailableDevelopmentActions[];
  onAddDevelopmentAction?: () => void;
  onAddMoreSkills: (category: CategoryWithSkills) => void;
}

export const DevelopmentActionListView: React.FC<SkillsContainerProps> = ({
  categories,
  editMode,
  availableDevelopmentActions,
  onAddDevelopmentAction,
  onAddMoreSkills,
}) => {
  const [isAddDevelopmentActionModalOpen, setIsAddDevelopmentActionModalOpen] = useState(false)
  const [isCreateCustomDevelopmentActionModalOpen, setIsCreateCustomDevelopmentActionModalOpen] = useState(false)
  const isTablet = useMedia({
    maxWidth: 768,
  })

  const handleCancel = () => {
    setIsAddDevelopmentActionModalOpen(false)
    setIsCreateCustomDevelopmentActionModalOpen(false)
  }

  const handleAddDevelopmentAction = () => {
    setIsAddDevelopmentActionModalOpen(true)
    onAddDevelopmentAction?.()
  }
  const handleCreateCustomDevelopmentAction = () => {
    setIsCreateCustomDevelopmentActionModalOpen(true)
    setIsAddDevelopmentActionModalOpen(false)
  }

  const renderCards = (skills: SkillWithDevelopmentActions[]) => {
    if (skills.length === 0) return <span>{I18n.t('idp.development_actions.no_development_actions')}</span>
    return skills.map(skill => (
      <DevelopmentActionLandscapeCard
        key={skill.id}
        editMode={editMode}
        handleAddDevelopmentAction={handleAddDevelopmentAction}
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
                {I18n.t('idp.development_actions.development_actions')}
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
                <Avatar size={24} />
                <h3 className={styles.h3}>{category.category}</h3>
              </Flex>
              <Flex gap={12} vertical>
                {renderCards(category.skills)}
              </Flex>
            </Flex>
            {editMode ? (
              <>
                <Divider className="mt-4" />
                <Button onClick={() => onAddMoreSkills(category)} className="ps-0" type="link">
                  <PlusOutlined />
                  {' '}
                  {I18n.t('idp.development_actions.add_skill')}
                </Button>
              </>
            ) : null}
          </BoxWithShadow>
        ))}
      </Flex>
      <AddDevelopmentActionModal
        data={availableDevelopmentActions}
        onAddAction={handleAddDevelopmentAction}
        onCreateCustomDevelopmentAction={handleCreateCustomDevelopmentAction}
        onCancel={handleCancel}
        open={isAddDevelopmentActionModalOpen}
      />
      <CreateCustomDevelopmentActionModal
        open={isCreateCustomDevelopmentActionModalOpen}
        onCancel={handleCancel}
      />
    </>

  )
}
