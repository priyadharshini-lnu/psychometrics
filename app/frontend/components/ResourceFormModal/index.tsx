import React, { useState } from 'react'
import {
  Modal, Button, Spin, Form, GetProp,
} from 'antd'
import { FormProps, FormInstance } from 'antd/es/form'
import { ModalProps } from 'antd/es/modal'
import { LoadingOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import ResourceForm from '../ResourceForm'
import { Status as ResourceStatus } from '../ResourceForm/constants'
import { Resource } from '../ResourceForm/interfaces'
import FieldsUtil from '../ResourceForm/FieldsUtil'

type FieldData = GetProp<FormProps, 'fields'>[number]

type ChildrenProps = {
  form: FormInstance,
  status: string,
  isEdit: boolean,
  fieldsUtil: FieldsUtil,
}
interface Props {
  resourceName: string
  requestScope?: string
  children({
    form, status, isEdit, fieldsUtil,
  }: ChildrenProps): React.ReactNode
  close(): void
  title?: string
  readableResourceName?: string
  resource?: Resource
  resourceId?: number
  resourceBaseUrl?: string
  showSuccessMessages?: boolean
  onSuccessfulSubmission?(response: object, values?: object): void
  request?: Partial<Request>
  storeManager?: {
    form?: FormInstance,
    fields?: FieldData[],
    setFields? (fields: object): void
  }
  modalProps: ModalProps
  formProps?: FormProps
  transformValues?(values: unknown): Record<string, unknown>
  scrollToFirstError?: boolean
  submitButtonName?: string
  nullifyEmptyString?: boolean
  manuallyClose?: boolean
  hideOkButton?: boolean
}

interface Request {
  fetchResource(): void
  createResource(values: object): void
  updateResource(values: object): void
  submit(values: object): Promise<unknown>
}

const { I18n } = window

const ResourceFormModal: React.FC<Props> = (props) => {
  const {
    close,
    onSuccessfulSubmission,
    storeManager,
    manuallyClose,
  } = props

  const [resourceStatus, setResourceStatus] = useState<string | null>(null)
  const [form] = Form.useForm()
  const store = {
    form: (storeManager && storeManager.form) || form,
    fields: (storeManager && storeManager.fields),
    setFields: (storeManager && storeManager.setFields),
  }

  const handleSuccessfulSubmission = (response: object, values: object) => {
    onSuccessfulSubmission && onSuccessfulSubmission(response, values)
    if (!manuallyClose) close()
  }

  return (
    <ResourceFormModalComponent form={store.form} resourceStatus={resourceStatus} {...props}>
      <ResourceForm
        {...props}
        storeManager={{ ...store, ...(storeManager || {}) }}
        onStatusChange={setResourceStatus}
        onSuccessfulSubmission={handleSuccessfulSubmission}
      />
    </ResourceFormModalComponent>
  )
}

type ResourceFormModalComponentProps = Omit<Props, 'children'> & {
  children: React.ReactNode
  resourceStatus: string | null
  form: FormInstance
}
export const ResourceFormModalComponent: React.FC<ResourceFormModalComponentProps> = (props) => {
  const {
    children,
    title,
    readableResourceName,
    resourceName,
    close,
    modalProps,
    resource,
    resourceId,
    submitButtonName,
    hideOkButton,
    resourceStatus,
    form,
  } = props
  const isEdit = () => !!resource || !!resourceId

  const saveButtonIcon = () => {
    if (resourceStatus === ResourceStatus.Saving) {
      return <LoadingOutlined />
    }
    return <CheckOutlined />
  }

  const getTitle = () => {
    if (title) { return title }

    return `${isEdit() ? I18n.t('common.actions.edit') : I18n.t('common.actions.add')}
     ${readableResourceName || resourceName}`
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

  const buttonName = (): string => {
    if (submitButtonName) return submitButtonName

    return isEdit() ? I18n.t('shared.update') : I18n.t('shared.add')
  }

  return (
    <Modal
      width={650}
      title={renderTitle()}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>
          {I18n.t('shared.cancel')}
        </Button>,
        !hideOkButton && (
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            disabled={resourceStatus === ResourceStatus.Saving}
          >
            {saveButtonIcon()}
            {buttonName()}
          </Button>
        ),
      ]}
      {...modalProps || {}}
    >
      {children}
    </Modal>
  )
}


export default ResourceFormModal
