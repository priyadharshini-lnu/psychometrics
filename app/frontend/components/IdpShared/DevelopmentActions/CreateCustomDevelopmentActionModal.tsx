import {
  Flex, Input, Modal, Select,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { DEVELOPMENT_ACTION_LEARNING_STYLE } from './Constants'


const { TextArea } = Input

const { I18n } = window

const { Option } = Select

type Props = {
  open: boolean
  onCancel: () => void
  onCreateCustomDevelopmentAction: (customAction: string, customActionLearningStyle: string) => void
}
export const CreateCustomDevelopmentActionModal = ({
  open,
  onCancel,
  onCreateCustomDevelopmentAction,
}: Props) => {
  const [textValue, setTextValue] = useState('')
  const [customActionLearningStyle, setCustomActionLearningStyle] = useState(DEVELOPMENT_ACTION_LEARNING_STYLE[0])
  const handleCreateCustomDevelopmentAction = () => {
    onCreateCustomDevelopmentAction(textValue, customActionLearningStyle)
    setTextValue('')
  }

  return (
    <Modal
      title={I18n.t('idp.development_actions.create_my_own')}
      open={open}
      onCancel={onCancel}
      onOk={handleCreateCustomDevelopmentAction}
      okText={I18n.t('common.actions.add')}
      okButtonProps={{ icon: <PlusOutlined /> }}
      cancelText={I18n.t('common.actions.cancel')}
      width={800}
    >
      <Flex vertical gap={8}>
        <Select
          defaultValue={customActionLearningStyle}
          onChange={e => setCustomActionLearningStyle(e)}
        >
          {
            DEVELOPMENT_ACTION_LEARNING_STYLE
              .map(style => (
                <Option key={style} value={style}>
                  {I18n.t(
                    `idp.development_actions.${style}`,
                  )}
                </Option>
              ))
          }
        </Select>
        <TextArea
          value={textValue}
          onChange={e => setTextValue(e.target.value)}
          placeholder={I18n.t('idp.development_actions.write_here')}
          autoSize={{ minRows: 3 }}
        />
      </Flex>
    </Modal>
  )
}
