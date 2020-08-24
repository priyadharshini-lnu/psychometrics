import React, { useState, ReactElement } from 'react'
import {
  Modal, Button, Spin, Form,
} from 'antd'
import { FormInstance } from 'antd/lib/form/util'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import _ from 'lodash'
import { FormProps } from 'antd/lib/form'
import { ModalProps } from 'antd/lib/modal'
import ResourceFrom from '../ResourceForm'
import { Status as ResourceStatus } from '../ResourceForm/constants'
import { Resource } from '../ResourceForm/interfaces'

interface Props {
  resourceName: string
  requestScope?: string
  children({ form: FormInstance, status: string, isEdit: boolean }): ReactElement
  close(): void
  title?: string
  resource?: Resource
  resourceId?: number
  resourceBaseUrl: string
  showSuccessMessages?: boolean
  onSuccessfulSubmission?(response: object): void
  request?: Partial<Request>
  storeManager?: {
    form: FormInstance
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
    title, resourceName, close, modalProps, resource, resourceId, onSuccessfulSubmission, storeManager,
  } = props

  const [resourceStatus, setResourceStatus] = useState<string | null>(null)
  const [form] = Form.useForm()
  const store = {
    form: (storeManager && storeManager.form) || form,
  }

  const isEdit = () => !!resource || !!resourceId

  const readableResourceName = (): string => _.capitalize(resourceName)

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

    return `${isEdit() ? 'Edit' : 'Add'} ${readableResourceName()}`
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
          {'Cancel'}
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
      <ResourceFrom
        {...props}
        storeManager={{ ...store, ...(storeManager || {}) }}
        onStatusChange={setResourceStatus}
        onSuccessfulSubmission={handleSuccessfulSubmission}
      />
    </Modal>
  )
}


export default ResourceFormModal
