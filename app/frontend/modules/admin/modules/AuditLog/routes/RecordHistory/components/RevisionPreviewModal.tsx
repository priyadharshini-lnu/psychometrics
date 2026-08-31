import React from 'react'
import { Modal, Spin } from 'antd'
import { ReactCodemirror } from '~/glint/components/ReactCodemirror'

const { I18n } = window

type Props = {
  revisionVersion: number | null
  isRevisionLoading: boolean
  revisionAttributes: unknown
  onClose: () => void
}

const RevisionPreviewModal: React.FC<Props> = ({
  revisionVersion,
  isRevisionLoading,
  revisionAttributes,
  onClose,
}) => (
  <Modal
    open={revisionVersion !== null}
    title={revisionVersion !== null
      ? `${I18n.t('admin.record_history_state_at_version')} ${revisionVersion}`
      : ''}
    footer={null}
    width={720}
    onCancel={onClose}
  >
    {isRevisionLoading ? (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    ) : (
      <ReactCodemirror
        value={JSON.stringify(revisionAttributes ?? {}, null, 2)}
        mode="json"
        readOnly
        lineWrapping
      />
    )}
  </Modal>
)

export default RevisionPreviewModal
