import React, { useState } from 'react'
import {
  Modal, Button, Icon, message,
} from 'antd'
import FileImport from './FileImport'

export default function EvaluatorImportModal ({
  current,
  closeModal,
  importFile,
  importInProgress,
  match: {
    params: { campaignId },
  },
}) {
  if (current !== 'EvaluatorImportModal') return null

  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState(null)

  const importButtonIcon = () => {
    if (importInProgress) {
      return <Icon type="loading" />
    }
    return <Icon type="import" />
  }

  const handleOnCancel = () => {
    setErrors(null)
    closeModal()
  }

  const handleFileImport = () => {
    const data = new FormData()
    data.append('file', file)
    importFile(campaignId, data)
      .then(() => {
        message.success('Evalutors imported successfully', 5)
      })
      .catch(setErrors)
  }

  return (
    <Modal
      width={700}
      title="Import Evaluators"
      visible
      onCancel={handleOnCancel}
      footer={[
        <Button key="back" onClick={handleOnCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={importInProgress || !file}
          onClick={handleFileImport}
        >
          {importButtonIcon()}
          Import
        </Button>,
      ]}
    >
      <FileImport setFile={setFile} errors={errors} campaignId={campaignId} />
    </Modal>
  )
}
