import { Flex, Input, Modal } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'

const { TextArea } = Input

const { I18n } = window

type Props = {
  open: boolean
  onCancel: () => void
  onCreateCustomDevelopmentAction: (data: string) => void
}
export const CreateCustomDevelopmentActionModal = ({
  open,
  onCancel,
  onCreateCustomDevelopmentAction,
}: Props) => {
  const [textValue, setTextValue] = useState('')
  const handleCreateCustomDevelopmentAction = () => {
    onCreateCustomDevelopmentAction(textValue)
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
      <Flex>
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
