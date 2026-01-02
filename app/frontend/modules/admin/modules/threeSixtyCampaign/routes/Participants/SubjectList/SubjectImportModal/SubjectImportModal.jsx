import { useState } from 'react'
import _ from 'lodash'
import {
  Modal, Button,
} from 'antd'
import cs from 'classnames'
import { useParams } from 'react-router-dom'
import { LoadingOutlined, ImportOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import UserList from '~/modules/admin/modules/threeSixtyCampaign/routes/UserList/UserList'
import FileImport from './FileImport'

export default function SubjectImportModal ({
  closeModal,
  importFile,
  importInProgress,
  clearImportData,
  errors,
  existingSubjectsWhosePasswordNotChanged,
}) {
  const { campaignId } = useParams()
  const [file, setFile] = useState(null)

  const importButtonIcon = () => {
    if (importInProgress) {
      return <LoadingOutlined />
    }
    return <ImportOutlined />
  }

  const handleOnCancel = () => {
    clearImportData()
    closeModal()
  }

  const showFileImport = () => _.isEmpty(existingSubjectsWhosePasswordNotChanged)

  const modalBody = () => {
    if (showFileImport()) {
      return <FileImport setFile={setFile} errors={errors} campaignId={campaignId} />
    }
    return <UserList dataSource={existingSubjectsWhosePasswordNotChanged} />
  }

  const modalTitle = () => (
    showFileImport() ? 'Import Subjects' : 'The list of users whose passwords were not changed'
  )

  return (
    <Modal
      width={700}
      title={modalTitle()}
      open
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
