import React, { useState } from 'react'
import { Tooltip, Button } from 'antd'
import { PipedTextModal } from './PipedTextModal'


interface Props {
  communicationKind: string
  onInsert: (value: string) => void
}

const { I18n } = window

export const SubjectPipedTextButton: React.FC<Props> = ({ communicationKind, onInsert }) => {
  const [modalVisible, setModalVisible] = useState(false)

  const openModal = () => {
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
  }

  return (
    <>
      <Tooltip title="Piped Text">
        <Button
          type="link"
          onClick={openModal}
        >
          {I18n.t('admin.communications_form_insert_piped_text')}
        </Button>
      </Tooltip>

      {modalVisible && (
        <PipedTextModal
          close={closeModal}
          editorRef={null}
          communicationKind={communicationKind}
          targetField="subject"
          onInsert={onInsert}
          open={modalVisible}
        />
      )}
    </>
  )
}
