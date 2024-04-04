import { Flex, Input, Modal } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const { TextArea } = Input

const { I18n } = window

type Props = {
  open: boolean
  onCancel: () => void
}
export const CreateCustomDevelopmentActionModal = ({
  open,
  onCancel,
}: Props) => (

  <Modal
    title={I18n.t('idp.development_actions.create_my_own')}
    open={open}
    onCancel={onCancel}
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
)
