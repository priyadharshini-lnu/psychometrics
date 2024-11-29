import {
  Modal, Button, InputNumber, Space,
} from 'antd'
import { useState } from 'react'

const { I18n } = window

const AutomaticPageBreakModal = ({
  model, close, automaticPageBreak, builder,
}) => {
  const [pbOffset, setPbOffset] = useState(1)
  const save = () => {
    automaticPageBreak(model, builder, pbOffset)
    close()
  }
  return (
    <Modal
      width="50%"
      title={I18n.t('administration.automatic_Page_Break.modal.title')}
      open
      maskClosable={false}
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>
          {I18n.t('common.actions.cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={save}>
          {I18n.t('common.actions.save')}
        </Button>,
      ]}
    >
      <div>
        <Space>
          <p>{I18n.t('administration.automatic_Page_Break.modal.after_every')}</p>
          <InputNumber
            value={pbOffset}
            min={0}
            max={model?.questions.length ?? 100}
            onChange={val => setPbOffset(val)}
          />
          <p>{I18n.t('administration.automatic_Page_Break.modal.questions')}</p>
        </Space>
      </div>
    </Modal>
  )
}

export default AutomaticPageBreakModal
