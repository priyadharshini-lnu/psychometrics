import { useRef, useState } from 'react'
import {
  Modal, Button, Alert, Form, Input, Select, Table, Tag, message, Spin,
} from 'antd'
import { PrettyPrintJson } from './PrettyPrintJson'
import { validateImport, submitImport, fetchClientsApi } from './api'

const { I18n } = window

/** @param {any} props */
const ImportModal = (props) => {
  const {
    title,
    validateEndpoint,
    importEndpoint,
    onClose,
    translations,
    isOpen = true,
    fileAccept = '.json',
    fileLabel = I18n.t('admin.dimensions_import_modal_select_json'),
    fileErrorMessage = I18n.t('admin.dimensions_import_modal_errors_file_error'),
    showMappableFields = true,
    skipValidation = false,
    sampleFilePath,
    sampleFileLabel,
    submitFileImport,
    successMessage,
    topActionLabel,
    onTopAction,
    showFileErrorAlert = true,
    chooseFileButtonLabel,
  } = props
  const [show, setShow] = useState(isOpen)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [jsonFileContent, setJsonFileContent] = useState(null)
  const [mappableValues, setMappableValues] = useState({})
  const [changeLog, setChangeLog] = useState([])
  const [errors, setErrors] = useState([])
  const [importFilevalidatonPending, setImportFilevalidatonPending] = useState(!skipValidation)
  const [form] = Form.useForm()
  const [clients, setClients] = useState([])
  const [isClientsLoading, setIsClientsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const fileInputRef = useRef(null)
  const operationColors = {
    Added: 'green',
    Deleted: 'red',
    Updated: 'orange',
  }

  const tableData = changeLog.map((item, index) => {
    const [operation, field, oldValue, newValue] = item

    return {
      key: index,
      operation,
      field,
      oldValue: JSON.stringify(oldValue, null, 2),
      newValue: JSON.stringify(newValue, null, 2),
    }
  })

  const columns = [
    {
      title: I18n.t('admin.dimensions_import_modal_operation'),
      dataIndex: 'operation',
      key: 'operation',
      width: '5%',
      render: op => (
        <Tag color={operationColors[op]}>
          {op}
        </Tag>
      ),
    },
    {
      title: I18n.t('admin.dimensions_import_modal_field'),
      dataIndex: 'field',
      key: 'field',
    },
    {
      title: I18n.t('admin.dimensions_import_modal_before'),
      dataIndex: 'oldValue',
      key: 'oldValue',
      width: '35%',
      render: (text, record) => (
        (text !== undefined && text !== null)
          ? <PrettyPrintJson data={text} operation={record.operation} />
          : '-'
      ),
    },
    {
      title: I18n.t('admin.dimensions_import_modal_after'),
      dataIndex: 'newValue',
      key: 'newValue',
      width: '35%',
      render: (text, record) => (
        (text !== undefined && text !== null)
          ? <PrettyPrintJson data={text} operation={record.operation} />
          : '-'
      ),
    },
  ]

  const handleClose = () => {
    setShow(false)
    if (onClose) {
      onClose()
    } else {
      setTimeout(() => {
        const modalContainer = document.getElementById('modal-container')
        if (modalContainer) {
          modalContainer.innerHTML = ''
        }
      }, 300)
    }
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setFileError(null)
    setErrors([])

    if (skipValidation) {
      setImportFilevalidatonPending(false)
    }
  }

  const handleContinue = () => {
    if (!file) {
      setFileError(fileErrorMessage)
      return
    }
    setFileError(null)

    if (!validateEndpoint) {
      setImportFilevalidatonPending(false)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target.result
        setJsonFileContent(content)

        validateImportFile(content)
      } catch (error) {
        setErrors([I18n.t('admin.dimensions_import_modal_errors_processing_error'), error])
      }
    }

    reader.readAsText(file)
  }

  const handleMappableValueChange = (resource, field, value) => {
    setMappableValues(prev => ({
      ...prev,
      [resource]: {
        ...(prev[resource] || {}),
        [field]: value,
      },
    }))
  }

  const validateImportFile = (content) => {
    setIsValidating(true)
    validateImport(validateEndpoint, content)
      .then((data) => {
        setErrors([])
        setChangeLog([])
        setImportFilevalidatonPending(false)
        if (data.change_logs && data.change_logs.length) {
          setChangeLog(data.change_logs)
        }
        if (data.errors) {
          setErrors(data.errors)
        }
        setIsValidating(false)
      })
      .catch((error) => {
        setErrors([I18n.t('admin.dimensions_import_modal_error_occurred'), error])
        setIsValidating(false)
      })
  }

  const submitImportFile = () => {
    if (!file) {
      setFileError(fileErrorMessage)
      return
    }

    setIsImporting(true)

    const submitPromise = submitFileImport
      ? submitFileImport(file, mappableValues)
      : submitImport(importEndpoint, jsonFileContent, mappableValues)

    submitPromise
      .then(() => {
        setShow(false)
        message.success(successMessage || I18n.t('admin.dimensions_import_modal_import_scheduled'))
        if (onClose) onClose()
        setIsImporting(false)
      })
      .catch((error) => {
        const defaultError = I18n.t('admin.dimensions_import_modal_error_occurred')
        const errorMessages = Array.isArray(error) ? error : [defaultError]
        setErrors(errorMessages)
        setIsImporting(false)
      })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    submitImportFile()
  }

  const fetchClients = (searchValue = '') => {
    setIsClientsLoading(true)
    fetchClientsApi('/api/v2/administration/clients', searchValue)
      .then((data) => {
        setClients(data.data || [])
        setIsClientsLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching clients:', error)
        setIsClientsLoading(false)
      })
  }

  const renderFileUpload = () => (
    <>
      {sampleFilePath && (
        <div className="mbl" style={{ fontSize: '16px' }}>
          <a href={sampleFilePath} target="_blank" rel="noreferrer">
            {sampleFileLabel || I18n.t('admin.dimensions_import_factors_sample_file')}
          </a>
        </div>
      )}
      <Form.Item
        label={fileLabel}
        required
        validateStatus={fileError ? 'error' : ''}
        help={fileError}
      >
        {chooseFileButtonLabel ? (
          <div className="flex items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept={fileAccept}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              {chooseFileButtonLabel}
            </Button>
            <span className="ms-3">{file?.name || I18n.t('admin.no_file_selected')}</span>
          </div>
        ) : (
          <Input
            type="file"
            accept={fileAccept}
            onChange={handleFileChange}
          />
        )}
      </Form.Item>
      {showFileErrorAlert && fileError && (
        <Alert
          message={I18n.t('admin.dimensions_import_modal_error')}
          description={fileError}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
    </>
  )

  const renderMappableFields = () => (
    <Form.Item
      name="ownerId"
      label={I18n.t('admin.dimensions_import_modal_owner_select')}
      rules={[{ message: I18n.t('admin.dimensions_import_modal_owner_input_validation') }]}
    >
      <Select
        showSearch
        placeholder={I18n.t('admin.dimensions_import_modal_owner_select')}
        onSearch={(value) => {
          fetchClients(value)
        }}
        notFoundContent={isClientsLoading ? <Spin size="small" /> : null}
        filterOption={false}
        onChange={value => handleMappableValueChange('dimensions', 'owner_id', value)}
      >
        {clients.map(client => (
          <Select.Option key={client.id} value={client.id}>
            {client.attributes.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  )

  const renderChangeLog = () => (
    <Form.Item label={I18n.t('admin.dimensions_import_modal_change_log_input')}>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <Table
          columns={columns}
          dataSource={tableData}
          bordered
          pagination={false}
        />
      </div>
    </Form.Item>
  )

  const renderErrors = () => (
    <Alert
      message={I18n.t('admin.dimensions_import_modal_error')}
      description={(
        <div>
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
      type="error"
      showIcon
      style={{ marginBottom: 16 }}
    />
  )

  const modalFooter = [
    <Button key="cancel" onClick={handleClose}>
      {translations?.cancel || 'Cancel'}
    </Button>,
    importFilevalidatonPending && (
      <Button key="continue" type="primary" onClick={handleContinue} loading={isValidating}>
        {translations?.continue || 'Continue'}
      </Button>
    ),
    !importFilevalidatonPending && !errors.length && (
      <Button key="import" type="primary" onClick={handleSubmit} loading={isImporting}>
        {translations?.import || 'Import'}
      </Button>
    ),
  ]

  return (
    <Modal
      open={show}
      title={title}
      onCancel={handleClose}
      footer={modalFooter}
      width="90%" // Set width to 90% of the viewport
      style={{
        maxWidth: '1200px', // Optional: Limit the maximum width
        top: 20, // Add some spacing from the top of the screen
      }}
      bodyStyle={{
        maxHeight: '70vh', // Limit the modal body height to 70% of the viewport height
        overflowY: 'auto', // Add vertical scrolling if content overflows
      }}
    >
      <Form form={form} layout="vertical">
        {onTopAction && (
          <div className="mbl">
            <Button type="primary" onClick={onTopAction}>
              {topActionLabel}
            </Button>
          </div>
        )}
        {errors.length > 0 && renderErrors()}
        {(importFilevalidatonPending || skipValidation) && renderFileUpload()}
        {showMappableFields && renderMappableFields()}
        {changeLog.length > 0 && renderChangeLog()}
      </Form>
    </Modal>
  )
}

export default ImportModal
