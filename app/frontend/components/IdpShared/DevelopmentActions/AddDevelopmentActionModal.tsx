import React, { useEffect, useState } from 'react'
import {
  Button,
  Flex, Radio, Modal,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { BoxWithShadow } from '~/glint'
import { AvailableDevelopmentActions, DevelopmentAction } from './Types'
import { DevelopmentActionsList } from './Common'

const { I18n } = window
type Props = {
  data: AvailableDevelopmentActions[]
  onAddAction: (developmentAction: Partial<DevelopmentAction>) => void,
  onShowCustomDevelopmentAction: () => void,
  onShowAIGeneratedDevelopmentActions: () => void,
  onCancel: () => void,
  open: boolean,
  selectedDevelopmentActionIds: (string | number)[],
}

const tabs = [
  { key: 'all', label: I18n.t('idp.development_actions.all') },
  { key: 'on_the_job', label: I18n.t('idp.development_actions.on_the_job') },
  { key: 'structured_learning', label: I18n.t('idp.development_actions.structured_learning') },
  { key: 'learning_from_others', label: I18n.t('idp.development_actions.learning_from_others') },
]

export const AddDevelopmentActionModal: React.FC<Props> = ({
  data,
  onAddAction,
  onShowCustomDevelopmentAction,
  onShowAIGeneratedDevelopmentActions,
  onCancel,
  open,
  selectedDevelopmentActionIds,
}) => {
  const [selectedTab, setSelectedTab] = useState('all')
  const [availableActions, setAvailableActions] = useState(data)
  const handleAddAction = (developmentAction: Partial<DevelopmentAction>) => {
    if (developmentAction.id && (selectedDevelopmentActionIds.includes(developmentAction.id)
      || selectedDevelopmentActionIds.includes(Number(developmentAction.id)))) return

    onAddAction(developmentAction)
  }

  useEffect(() => {
    if (selectedTab === 'all') return setAvailableActions(data)
    setAvailableActions(data.filter(action => action.learningStyle === selectedTab))
  }, [data, selectedTab])

  const handleTabChange = (e) => {
    setSelectedTab(e.target.value)
  }

  const handleShowCustomDevelopmentAction = () => {
    onShowCustomDevelopmentAction()
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <Modal
      title={I18n.t('idp.development_actions.heading')}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
    >
      <Flex vertical gap={18}>
        <Flex justify="flex-end" gap={8}>
          <Button icon={<PlusOutlined />} onClick={onShowAIGeneratedDevelopmentActions}>
            {I18n.t('idp.development_actions.generate_by_ai')}
          </Button>
          <Button icon={<PlusOutlined />} onClick={handleShowCustomDevelopmentAction}>
            {I18n.t('idp.development_actions.create_my_own')}
          </Button>
        </Flex>
        <Radio.Group value={selectedTab} onChange={handleTabChange}>
          {tabs.map(tab => (
            <Radio.Button key={tab.key} value={tab.key}>
              {tab.label}
            </Radio.Button>
          ))}
        </Radio.Group>
        <BoxWithShadow>
          <DevelopmentActionsList
            availableActions={availableActions}
            onDevelopmentActionClick={handleAddAction}
            selectedDevelopmentActionIds={selectedDevelopmentActionIds}
          />
        </BoxWithShadow>
      </Flex>
    </Modal>
  )
}
