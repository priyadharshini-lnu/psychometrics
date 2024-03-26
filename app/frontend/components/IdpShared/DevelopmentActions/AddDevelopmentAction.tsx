import {
  Button,
  Flex, Input, Modal, Radio, Tag, Typography, Image,
} from 'antd'
import React, { useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Skill } from './DevelopmentActionListView'
import styles from './AddDevelopmentAction.less'
import { BoxWithShadow } from '~/glint'


const { TextArea } = Input

const { I18n } = window
interface Props {
  skills: Skill[]
  onAddAction: () => void,
}

const tabs = [
  { key: 'all', label: I18n.t('idp.development_actions.all') },
  { key: 'on_the_job', label: I18n.t('idp.development_actions.on_the_job') },
  { key: 'structured_learning', label: I18n.t('idp.development_actions.structured_learning') },
  { key: 'learning_from_the_others', label: I18n.t('idp.development_actions.learning_from_the_others') },
]


const AddDevelopmentAction: React.FC<Props> = ({
  skills,
  onAddAction,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const handleAddAction = () => {
    onAddAction()
  }

  const cards = (skills.map(skill => (
    <Flex
      onClick={handleAddAction}
      className={styles.card}
      gap={16}
      key={skill.id}
    >
      <Flex vertical>
        {skill.name ? (
          <h5 className={`${styles.m_none} ${styles.p_none}`}>
            {skill.name}
          </h5>
        ) : null}
        <Typography.Paragraph
          ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
        >
          {skill.description}
        </Typography.Paragraph>
        <Flex gap={8}>
          <Tag color="geekblue">{skill.durationType}</Tag>
          <Tag>{skill.durationNumber}</Tag>
        </Flex>
      </Flex>
      <Flex>
        <Image
          width={200}
          height={100}
          src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        />
      </Flex>
    </Flex>
  )))

  return (
    <>
      <Flex vertical gap={18}>
        <Flex justify="flex-end" gap={8}>
          <Button icon={<PlusOutlined />}>
            {I18n.t('idp.development_actions.generate_by_ai')}
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            {I18n.t('idp.development_actions.create_my_own')}
          </Button>
        </Flex>
        <Radio.Group value="all">
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
      <Modal
        title={I18n.t('idp.development_actions.create_my_own')}
        open={isModalOpen}
        onCancel={handleCancel}
        okText={I18n.t('common.actions.add')}
        okButtonProps={{ icon: <PlusOutlined /> }}
        cancelText={I18n.t('common.actions.cancel')}
        width={800}
      >
        <Flex>
          <TextArea
            placeholder={I18n.t('idp.development_actions.write_here')}
            autoSize={{ minRows: 3 }}
          />
        </Flex>
      </Modal>
    </>
  )
}

export default AddDevelopmentAction
