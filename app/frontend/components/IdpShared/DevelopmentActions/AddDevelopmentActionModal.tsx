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
  { key: 'on_the_job', label: I18n.t('shared.learning_on_the_job_label') },
  { key: 'learning_from_others', label: I18n.t('shared.collaborative_learning') },
  { key: 'structured_learning', label: I18n.t('shared.formal_learning') },
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
      title={(
        <>
          <span className="font-normal">
            {I18n.t('idp.development_actions.add_development_actions_modal_title')}
          </span>
          <span className="font-bold">
            {` ${skillName}`}
          </span>
        </>
      )}
      open={open}
      onCancel={handleCancel}
      width={800}
      styles={{
        wrapper: {
          overflow: 'hidden',
        },
      }}
      destroyOnHidden
      focusable={{
        focusTriggerAfterClose: true,
      }}
      getContainer={document.querySelector('#endUserContainer') as HTMLElement}
      closeIcon={<Button style={{ border: 'none' }} ref={btnRef} icon={<CloseOutlined />} />}
      wrapClassName={wrapClassName}
      afterOpenChange={(isOpen) => {
        if (isOpen && btnRef && btnRef?.current) {
          btnRef?.current?.focus()
        }
      }}
      mask={{ closable: false }}
      footer={(
        <Flex justify="flex-end" flex={1} gap={12}>
          {selectedDA.length > 0 && (
            <Typography.Text>
              {I18n.t('enduser.selected_count', {
                count: selectedDA.length,
              })}
            </Typography.Text>
          )}
          <ButtonWithArrow
            label={I18n.t('common.actions.add')}
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
          placeholder={I18n.t('idp.development_actions.search_development_actions')}
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
