import { useState } from 'react'
import {
  Modal, Button, Alert, Form, Input, Select, Table, Tag, message, Spin,
} from 'antd'
import { PrettyPrintJson } from './PrettyPrintJson'
import { validateImport, submitImport, fetchClientsApi } from './api'

const { I18n } = window

const ImportModal = ({
  title,
  validateEndpoint,
  importEndpoint,
  onClose,
  translations,
  isOpen = true,
}) => {
  const [show, setShow] = useState(isOpen)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [jsonFileContent, setJsonFileContent] = useState(null)
  const [mappableValues, setMappableValues] = useState({})
  const [changeLog, setChangeLog] = useState([])
  const [errors, setErrors] = useState([])
  const [importFilevalidatonPending, setImportFilevalidatonPending] = useState(true)
  const [form] = Form.useForm()
  const [clients, setClients] = useState([])
  const [isClientsLoading, setIsClientsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
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
      title: I18n.t('administration.dimensions.import_modal.operation'),
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
      title: I18n.t('administration.dimensions.import_modal.field'),
      dataIndex: 'field',
      key: 'field',
    },
    {
      title: I18n.t('administration.dimensions.import_modal.before'),
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
      title: I18n.t('administration.dimensions.import_modal.after'),
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
  }

  const handleContinue = () => {
    if (!file) {
      setFileError(I18n.t('administration.dimensions.import_modal.errors.file_error'))
      return
    }
    setFileError(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target.result
        setJsonFileContent(content)

        validateImportFile(content)
      } catch (error) {
        setErrors([I18n.t('administration.dimensions.import_modal.errors.processing_error'), error])
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
        setErrors([I18n.t('administration.dimensions.import_modal.error_occurred'), error])
        setIsValidating(false)
      })
  }

  const submitImportFile = () => {
    setIsImporting(true)
    submitImport(importEndpoint, jsonFileContent, mappableValues)
      .then(() => {
        setShow(false)
        message.success(I18n.t('administration.dimensions.import_modal.import_scheduled'))
        if (onClose) onClose()
        setIsImporting(false)
      })
      .catch(() => {
        setErrors([I18n.t('administration.dimensions.import_modal.error_occurred')])
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
      <Form.Item
        label={I18n.t('administration.dimensions.import_modal.select_json')}
        required
        validateStatus={fileError ? 'error' : ''}
        help={fileError}
      >
        <Input
          type="file"
          accept=".json"
          onChange={handleFileChange}
        />
      </Form.Item>
      {fileError && (
        <Alert
          message={I18n.t('administration.dimensions.import_modal.error')}
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
      label={I18n.t('administration.dimensions.import_modal.owner_select')}
      rules={[{ message: I18n.t('administration.dimensions.import_modal.owner_input_validation') }]}
    >
      <Select
        showSearch
        placeholder={I18n.t('administration.dimensions.import_modal.owner_select')}
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
    <Form.Item label={I18n.t('administration.dimensions.import_modal.change_log_input')}>
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
      message={I18n.t('administration.dimensions.import_modal.error')}
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
        {errors.length > 0 && renderErrors()}
        {importFilevalidatonPending && renderFileUpload()}
        {renderMappableFields()}
        {changeLog.length > 0 && renderChangeLog()}
      </Form>
    </Modal>
  )
}

export default ImportModal
