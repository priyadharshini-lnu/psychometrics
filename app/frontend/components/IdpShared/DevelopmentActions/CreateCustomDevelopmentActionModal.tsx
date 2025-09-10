import {
  Flex, Input, Modal, Select,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { DEVELOPMENT_ACTION_LEARNING_STYLE, developmentActionLearningStylesConfig } from './Constants'
import {
  ButtonWithArrow,
} from '~/glint'

const { TextArea } = Input

const { I18n } = window

const { Option } = Select

type Props = {
  open: boolean
  onCancel: () => void
  onCreateCustomDevelopmentAction: (name: string,
    description: string, learningStyle: string) => void
  skillName: string
}

export const CreateCustomDevelopmentActionModal = ({
  open,
  onCancel,
  onCreateCustomDevelopmentAction,
  skillName,
}: Props) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [learningStyle, setLearningStyle] = useState(DEVELOPMENT_ACTION_LEARNING_STYLE[0])
  const handleCreateCustomDevelopmentAction = () => {
    onCreateCustomDevelopmentAction(name, description, learningStyle)
    setName('')
    setDescription('')
  }

  return (
    <Modal
      title={I18n.t('idp.development_actions.create_custom_development_action_title', { skillName })}
      open={open}
      onCancel={onCancel}
      okText={I18n.t('common.actions.add')}
      okButtonProps={{ icon: <PlusOutlined /> }}
      cancelText={I18n.t('common.actions.cancel')}
      width={800}
      maskClosable={false}
      footer={(
        <Flex justify="flex-end" flex={1} gap={12}>
          <ButtonWithArrow
            label="Add"
            size="small"
            type="primary"
            onClick={handleCreateCustomDevelopmentAction}
            disabled={!name || !description}
          />
        </Flex>
      )}
    >
      <Flex vertical gap={8}>
        <Select
          defaultValue={learningStyle}
          onChange={e => setLearningStyle(e)}
        >
          {
            DEVELOPMENT_ACTION_LEARNING_STYLE
              .map(learningStyle => (
                <Option key={learningStyle} value={learningStyle}>
                  <Flex align="center">
                    <img
                      src={developmentActionLearningStylesConfig[learningStyle].logo}
                      alt={I18n.t(`idp.development_actions.${learningStyle}`)}
                      style={{ marginRight: 8, width: '2rem' }}
                    />
                    {I18n.t(`idp.development_actions.${learningStyle}`)}
                  </Flex>
                </Option>
              ))
          }
        </Select>

        <Input
          placeholder={I18n.t('idp.development_actions.enter_development_action_title')}
          value={name}
          onChange={e => setName(e.target.value)}
          className="fs-16"
        />
        <TextArea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={I18n.t('idp.development_actions.enter_development_action_description')}
          autoSize={{ minRows: 8, maxRows: 20 }}
          size="large"
        />
      </Flex>
    </Modal>
  )
}
