import React, { useState } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Icon, Alert,
} from 'antd'
import UserList from 'admin/core/threeSixtyCampaign/components/UserList/UserList'
import FileImport from './FileImport'
import cs from 'classnames'

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
      return  <Icon type="loading" />
    } else {
      return <Icon type="import" />
    }
  }

  const handleOnCancel = () => {
    clearImportData()
    closeModal()
  }

  const showFileImport = () => _.isEmpty(existingSubjectWhosePasswordNotChanged)

  const modalBody = () => {
    if (showFileImport()) {
      return <FileImport setFile={setFile} errors={errors} />
    } else {
      return <UserList dataSource={existingSubjectWhosePasswordNotChanged} />
    }
  }

  const modalTitle = () => (showFileImport() ? 'Import Subjects' : 'The list of users whose passwords will be not changed')

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
        <Button key="submit" type="primary"
          disabled={importInProgress}
          className={cs({hidden: !showFileImport()})}
          onClick={() => {
            let data = new FormData();
            data.append('file', file);
            importFile(campaignId, data)}
          }>
          {importButtonIcon()}
          Import
        </Button>,
      ]}
    >
      {modalBody()}
    </Modal>
  )
}
