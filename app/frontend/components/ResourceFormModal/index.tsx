import React, { useState, ReactElement } from 'react'
import {
  Modal, Button, Spin, Form,
} from 'antd'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import { FormProps, FormInstance } from 'antd/lib/form'
import { ModalProps } from 'antd/lib/modal'
import { FieldData } from 'rc-field-form/lib/interface'
import ResourceForm from '../ResourceForm'
import { Status as ResourceStatus } from '../ResourceForm/constants'
import { Resource } from '../ResourceForm/interfaces'

interface Props {
  resourceName: string
  requestScope?: string
  children({
    form: FormInstance, status: string, isEdit: boolean, fieldsUtil: FieldsUtil,
  }): ReactElement
  close(): void
  title?: string
  readableResourceName?: string
  resource?: Resource
  resourceId?: number
  resourceBaseUrl: string
  showSuccessMessages?: boolean
  onSuccessfulSubmission?(response: object): void
  request?: Partial<Request>
  storeManager?: {
    form?: FormInstance,
    fields?: FieldData[],
    setFields? (fields: object): void
  }
  modalProps: ModalProps
  formProps?: FormProps
  transformValues?(values: object): object
  scrollToFirstError?: boolean
}

interface Request {
  fetchResource(): void
  createResource(values: object): void
  updateResource(values: object): void
}

const ResourceFormModal: React.FC<Props> = (props) => {
  const {
    title,
    readableResourceName,
    resourceName,
    close,
    modalProps,
    resource,
    resourceId,
    onSuccessfulSubmission,
    storeManager,
  } = props

  const [resourceStatus, setResourceStatus] = useState<string | null>(null)
  const [form] = Form.useForm()
  const store = {
    form: (storeManager && storeManager.form) || form,
    fields: (storeManager && storeManager.fields),
    setFields: (storeManager && storeManager.setFields),
  }

  const isEdit = () => !!resource || !!resourceId

  const handleSuccessfulSubmission = (response: object) => {
    onSuccessfulSubmission && onSuccessfulSubmission(response)
    close()
  }

  const saveButtonIcon = () => {
    if (resourceStatus === ResourceStatus.Saving) {
      return <LoadingOutlined />
    }
    return <CheckOutlined />
  }

  const getTitle = () => {
    if (title) { return title }

    return `${isEdit() ? 'Edit' : 'Add'} ${readableResourceName || resourceName}`
  }

  const renderTitle = () => {
    if (resourceStatus === ResourceStatus.Loading) {
      return (
        <div>
          {getTitle()}
          &nbsp;
          <Spin />
        </div>
      )
    }

    return getTitle()
  }

  return (
    <Modal
      width={650}
      title={renderTitle()}
      visible
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => store.form.submit()}
          disabled={resourceStatus === ResourceStatus.Saving}
        >
          {saveButtonIcon()}
          {isEdit() ? 'Update' : 'Add'}
        </Button>,
      ]}
      {...modalProps || {}}
    >
      <ResourceForm
        {...props}
        storeManager={{ ...store, ...(storeManager || {}) }}
        onStatusChange={setResourceStatus}
        onSuccessfulSubmission={handleSuccessfulSubmission}
      />
    </Modal>
  )
}


export default ResourceFormModal
