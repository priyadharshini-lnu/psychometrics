import React, { useEffect, useState } from 'react'
import {
  Flex, Radio, Modal, Input, Spin,
  Typography,
} from 'antd'
import {
  ButtonWithArrow, BoxWithShadow,
} from '~/glint'
import { DevelopmentAction } from './Types'
import { DevelopmentActionsList } from './Common'


const { I18n } = window
type Props = {
  data: DevelopmentAction[]
  onAddAction: (developmentAction: Partial<DevelopmentAction[]>) => void,
  onCancel: () => void,
  open: boolean,
  selectedDevelopmentActionIds: (string | number)[],
  isDALoading?: boolean;
  skillName: string;
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
  onCancel,
  open,
  selectedDevelopmentActionIds,
  isDALoading = false,
  skillName,
}) => {
  const [selectedTab, setSelectedTab] = useState('all')

  const [availableActions, setAvailableActions] = useState<DevelopmentAction[]>([])

  const [selectedDA, setSelectedDA] = useState<DevelopmentAction[]>([])

  const [searchTerm, setSearchTerm] = useState('')

  const handleAddAction = (developmentAction: Partial<DevelopmentAction[]>) => {
    onAddAction(developmentAction)
  }

  useEffect(() => {
    if (selectedTab === 'all') {
      return setAvailableActions(data.filter(action => action.name.toLowerCase().includes(searchTerm.toLowerCase())
        || action.description.toLowerCase().includes(searchTerm.toLowerCase())))
    }
    setAvailableActions(data.filter(action => action.learningStyle === selectedTab)
      .filter(action => action.name.toLowerCase().includes(searchTerm.toLowerCase())
       || action.description.toLowerCase().includes(searchTerm.toLowerCase())))
  }, [data, selectedTab, searchTerm])

  const handleTabChange = (e) => {
    setSelectedTab(e.target.value)
  }

  const handleCancel = () => {
    resetFields()
    onCancel()
  }

  const onAddDA = () => {
    resetFields()
    handleAddAction(selectedDA)
  }

  const resetFields = () => {
    setSelectedTab('all')
    setSearchTerm('')
    setAvailableActions([])
    setSelectedDA([])
  }

  return (
    <Modal
      title={I18n.t('idp.development_actions.add_development_actions_modal_title', { skillName })}
      open={open}
      onCancel={handleCancel}
      width={800}
      styles={{
        wrapper: {
          overflow: 'hidden',
        },
      }}
      maskClosable={false}
      footer={(
        <Flex justify="flex-end" flex={1} gap={12}>
          {selectedDA.length > 0 && <Typography.Text>{`${selectedDA.length} selected`}</Typography.Text>}
          <ButtonWithArrow
            label="Add"
            size="small"
            type="primary"
            disabled={selectedDA.length === 0}
            onClick={onAddDA}
          />
        </Flex>
      )}
    >
      <Flex vertical gap={18}>
        <Radio.Group value={selectedTab} onChange={handleTabChange}>
          {tabs.map(tab => (
            <Radio.Button
              style={{
                fontWeight:
              'normal',
              }}
              key={tab.key}
              value={tab.key}
            >
              {tab.label}
            </Radio.Button>
          ))}
        </Radio.Group>
        <Input
          onChange={(e) => {
            setSearchTerm(e.target.value)
          }}
          value={searchTerm}
          placeholder="Search Development Actions"
        />
        <BoxWithShadow>
          {isDALoading ? (
            <Flex justify="center" align="center" style={{ height: '200px' }}>
              <Spin />
            </Flex>
          ) : (
            <DevelopmentActionsList
              availableActions={availableActions}
              selectedDA={selectedDA}
              setSelectedDA={setSelectedDA}
              selectedDevelopmentActionIds={selectedDevelopmentActionIds}
            />
          )}

        </BoxWithShadow>
      </Flex>
    </Modal>
  )
}
