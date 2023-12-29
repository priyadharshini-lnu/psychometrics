import { useState } from 'react'
import {
  Modal, Button, App,
} from 'antd'
import { LoadingOutlined, ImportOutlined } from '@ant-design/icons'
import cs from 'classnames'
import _ from 'lodash'
import UserList from '~/modules/admin/modules/threeSixtyCampaign/routes/UserList/UserList'
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
  const { message } = App.useApp()

  const importButtonIcon = () => {
    if (importInProgress) {
      return <LoadingOutlined />
    }
    return <ImportOutlined />
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
      open
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
