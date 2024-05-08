import React, { useEffect, useState } from 'react'
import {
  Button,
  Flex, Radio, Typography, Empty, Modal,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { BoxWithShadow } from '~/glint'
import { AvailableDevelopmentActions, DevelopmentAction } from '.'
import { Tags } from './Tags'
import styles from './AddDevelopmentActionModal.less'

const { I18n } = window
type Props = {
  data: AvailableDevelopmentActions[]
  onAddAction: (developmentAction: Partial<DevelopmentAction>) => void,
  onShowCustomDevelopmentAction: () => void,
  onCancel: () => void,
  open: boolean,
}

const tabs = [
  { key: 'all', label: I18n.t('idp.development_actions.all') },
  { key: 'on_the_job', label: I18n.t('idp.development_actions.on_the_job') },
  { key: 'structured_learning', label: I18n.t('idp.development_actions.structured_learning') },
  { key: 'learning_from_the_others', label: I18n.t('idp.development_actions.learning_from_the_others') },
]

export const AddDevelopmentActionModal: React.FC<Props> = ({
  data,
  onAddAction,
  onShowCustomDevelopmentAction,
  onCancel,
  open,
}) => {
  const [selectedTab, setSelectedTab] = useState('all')
  const [availableActions, setAvailableActions] = useState(data)
  const handleAddAction = (developmentAction: Partial<DevelopmentAction>) => {
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

  const cards = availableActions.length > 0 ? (availableActions.map(developmentAction => (
    <Flex
      onClick={() => handleAddAction(developmentAction)}
      className={styles.card}
      gap={16}
      key={developmentAction.id}
    >
      <Flex vertical flex={1}>
        {developmentAction.name ? (
          <Typography.Title
            level={5}
            ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
          >
            {developmentAction.name}
          </Typography.Title>
        ) : null}
        <Typography.Paragraph
          ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
        >
          {developmentAction.description}
        </Typography.Paragraph>
        <Flex>
          <Tags type={developmentAction.learningStyle} />
        </Flex>
      </Flex>
      {developmentAction.image ? (
        <Flex>
          <img
            src={developmentAction.image}
            className={styles.image}
          />
        </Flex>
      ) : null}
    </Flex>
  ))) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />

  return (
    <Modal
      title={I18n.t('idp.development_actions.development_actions')}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      className={styles.modal}
    >
      <Flex vertical gap={18}>
        <Flex justify="flex-end" gap={8}>
          <Button icon={<PlusOutlined />}>
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
          <Flex vertical className={styles.card_content}>
            {cards}
          </Flex>
        </BoxWithShadow>
      </Flex>
    </Modal>
  )
}
