import React from 'react'
import {
  Button, Modal,
} from 'antd'

const { I18n } = window

interface Props {
  show: boolean
  close(): void
}

const EditEvaluationModal: React.FC<Props> = ({
  show, close,
}) => {
  if (!show) { return null }

  const getViewPath = () => '?read=true'

  const getEditPath = () => '?edit=true'

  return (
    <Modal
      title={(
        <div className="help-modal-header">
          {I18n.t('campaign.edit_evaluation.title')}
        </div>
      )}
      visible={show}
      onCancel={close}
      footer={(
        <div>
          <a href={getViewPath()} style={{ marginRight: 8 }}>
            <Button type="primary">
              {I18n.t('campaign.edit_evaluation.view')}
            </Button>
          </a>
          <a href={getEditPath()}>
            <Button type="danger">
              {I18n.t('campaign.edit_evaluation.edit')}
            </Button>
          </a>
        </div>
      )}
    >
      <div className="help-modal-body">
        {I18n.t('campaign.edit_evaluation.body')}
      </div>
    </Modal>
  )
}

export default EditEvaluationModal
