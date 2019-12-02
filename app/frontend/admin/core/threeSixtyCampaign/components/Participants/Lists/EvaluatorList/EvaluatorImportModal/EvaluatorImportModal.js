import React, { useState } from 'react'
import {
  Modal, Button, Icon, message,
} from 'antd'
import UserList from 'admin/core/threeSixtyCampaign/components/UserList/UserList'
import cs from 'classnames'
import FileImport from './FileImport'

export default function EvaluatorImportModal ({
  closeModal,
  importFile,
  importInProgress,
  match: {
    params: { campaignId },
  },
}) {
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState(null)
  const [evaluatorsWhosePasswordNotChanged, setEvaluatorsWhosePasswordNotChanged] = useState(null)

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

  const showFileImport = () => _.isEmpty(evaluatorsWhosePasswordNotChanged)

  const modalBody = () => {
    if (showFileImport()) {
      return <FileImport setFile={setFile} errors={errors} campaignId={campaignId} />
    }
    return <UserList dataSource={evaluatorsWhosePasswordNotChanged} />
  }

  const modalTitle = () => (
    showFileImport() ? 'Import Evaluators' : 'The list of users whose passwords were not changed'
  )

  const handleFileImport = () => {
    const data = new FormData()
    data.append('file', file)
    importFile(campaignId, data)
      .then(({ response: { existingEvaluatorsWhosePasswordNotChanged } }) => {
        if (_.isEmpty(existingEvaluatorsWhosePasswordNotChanged)) {
          message.success('Evalutors imported successfully', 5)
          closeModal()
        } else {
          setEvaluatorsWhosePasswordNotChanged(existingEvaluatorsWhosePasswordNotChanged)
        }
      })
      .catch(setErrors)
  }

  return (
    <Modal
      width={700}
      title={modalTitle()}
      visible
      onCancel={handleOnCancel}
      footer={[
        <Button key="back" onClick={handleOnCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          className={cs({ hidden: !showFileImport() })}
          disabled={importInProgress || !file}
          onClick={handleFileImport}
        >
          {importButtonIcon()}
          Import
        </Button>,
      ]}
    >
      {modalBody()}
    </Modal>
  )
}
