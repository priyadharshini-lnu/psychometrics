import React, { useState } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Icon,
} from 'antd'
import UserList from 'admin/core/threeSixtyCampaign/components/UserList/UserList'
import cs from 'classnames'
import FileImport from './FileImport'

export default function SubjectImportModal ({
  current,
  closeModal,
  importFile,
  importInProgress,
  clearImportData,
  errors,
  existingSubjectWhosePasswordNotChanged,
  match: {
    params: { campaignId },
  },
}) {
  if (current !== 'SubjectImportModal') return null
  const [file, setFile] = useState(null)

  const importButtonIcon = () => {
    if (importInProgress) {
      return <Icon type="loading" />
    }
    return <Icon type="import" />
  }

  const handleOnCancel = () => {
    clearImportData()
    closeModal()
  }

  const showFileImport = () => _.isEmpty(existingSubjectWhosePasswordNotChanged)

  const modalBody = () => {
    if (showFileImport()) {
      return <FileImport setFile={setFile} errors={errors} campaignId={campaignId} />
    }
    return <UserList dataSource={existingSubjectWhosePasswordNotChanged} />
  }

  const modalTitle = () => (
    showFileImport() ? 'Import Subjects' : 'The list of users whose passwords were not changed'
  )

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
          disabled={importInProgress || _.isNull(file)}
          className={cs({ hidden: !showFileImport() })}
          onClick={() => {
            const data = new FormData()
            data.append('file', file)
            importFile(campaignId, data)
          }
          }
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
