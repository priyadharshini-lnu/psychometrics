import React, { useState } from 'react'
import { Modal, Checkbox } from 'antd'

const { I18n } = window

export interface Props {
  close(): void
  name: string
  action: (allowAiRescore: boolean) => void
}

const RescoreResponseModal: React.FC<Props> = ({ close, name, action }) => {
  const [allowAiRescore, setAllowAiRescore] = useState(false)

  const handleOk = () => {
    action(allowAiRescore)
    close()
  }

  return (
    <Modal
      title={I18n.t('campaign_assessment.modals.rescore_response.title', { name })}
      open
      onOk={handleOk}
      onCancel={close}
    >
      <div style={{ marginTop: 16 }}>
        <p>
          {I18n.t('admin.rescore_responses_content')}
        </p>
        <Checkbox
          checked={allowAiRescore}
          onChange={e => setAllowAiRescore(e.target.checked)}
        >
          {I18n.t('admin.allow_ai_rescoring')}
        </Checkbox>
      </div>
    </Modal>
  )
}

export default RescoreResponseModal
