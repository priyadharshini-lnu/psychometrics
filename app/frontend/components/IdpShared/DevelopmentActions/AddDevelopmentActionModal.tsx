import React, { useEffect, useState, useRef } from 'react'
import {
  Flex, Radio, Modal, Input, Spin,
  Typography, Button,
} from 'antd'
import { CloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
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
  wrapClassName?: string;
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
  wrapClassName,
}) => {
  const [selectedTab, setSelectedTab] = useState('all')

  const [availableActions, setAvailableActions] = useState<DevelopmentAction[]>([])

  const [selectedDA, setSelectedDA] = useState<DevelopmentAction[]>([])

  const [searchTerm, setSearchTerm] = useState('')

  const btnRef = useRef<HTMLButtonElement | null>(null)

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
      destroyOnClose
      focusTriggerAfterClose
      getContainer={document.querySelector('#endUserContainer') as HTMLElement}
      closeIcon={<Button style={{ border: 'none' }} ref={btnRef} icon={<CloseOutlined />} />}
      wrapClassName={wrapClassName}
      afterOpenChange={(isOpen) => {
        if (isOpen && btnRef && btnRef?.current) {
          btnRef?.current?.focus()
        }
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
        <Radio.Group
          aria-label={I18n.t('idp.development_actions.filter_development_actions')}
          value={selectedTab}
          onChange={handleTabChange}
        >
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
            <Flex
              aria-live="polite"
              aria-label={I18n.t('idp.development_actions.loading_development_actions')}
              justify="center"
              align="center"
              style={{ height: '200px' }}
            >
              <Spin aria-hidden="true" />
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
