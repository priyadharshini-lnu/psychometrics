import {
  Flex, Input, Select, Modal, Button,
} from 'antd'
import { useRef, useState } from 'react'
import { CloseOutlined, PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
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
  wrapClassName?: string;
}

export const CreateCustomDevelopmentActionModal = ({
  open,
  onCancel,
  onCreateCustomDevelopmentAction,
  skillName,
  wrapClassName,
}: Props) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [learningStyle, setLearningStyle] = useState(DEVELOPMENT_ACTION_LEARNING_STYLE[0])
  const btnRef = useRef<HTMLButtonElement | null>(null)

  const handleCreateCustomDevelopmentAction = () => {
    onCreateCustomDevelopmentAction(name, description, learningStyle)
    setName('')
    setDescription('')
  }

  return (
    <Modal
      title={(
        <>
          <span className="font-normal">
            {I18n.t('idp.development_actions.create_custom_development_action_title')}
          </span>
          <span className="font-bold">
            {` ${skillName}`}
          </span>
        </>
      )}
      open={open}
      onCancel={onCancel}
      okText={I18n.t('common.actions.add')}
      okButtonProps={{ icon: <PlusOutlined /> }}
      closeIcon={<Button style={{ border: 'none' }} ref={btnRef} icon={<CloseOutlined />} />}
      cancelText={I18n.t('common.actions.cancel')}
      width={800}
      wrapClassName={wrapClassName}
      mask={{ closable: false }}
      afterOpenChange={(isOpen) => {
        if (isOpen && btnRef && btnRef?.current) {
          btnRef?.current?.focus()
        }
      }}
      footer={(
        <Flex justify="flex-end" flex={1} gap={12}>
          <ButtonWithArrow
            label={I18n.t('common.actions.add')}
            size="small"
            type="primary"
            onClick={handleCreateCustomDevelopmentAction}
            disabled={!name.trim() || !description.trim()}
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
                      aria-hidden="true"
                      src={developmentActionLearningStylesConfig[learningStyle].logo}
                      alt={I18n.t(`idp.development_actions.${learningStyle}`)}
                      style={{ marginInlineEnd: 8, width: '2rem' }}
                    />
                    {developmentActionLearningStylesConfig[learningStyle].text}
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
