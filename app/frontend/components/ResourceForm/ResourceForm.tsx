import React, { useState, useEffect, ReactElement } from 'react'
import { Form, message } from 'antd'
import { FormInstance } from 'antd/lib/form/util'
import { FormProps } from 'antd/lib/form'
import _ from 'lodash'
import { FieldData } from 'rc-field-form/lib/interface'
import { Status } from './constants'
import { Resource } from './interfaces'

interface Props {
  resourceName: string
  defaultRequest: Request
  resource?: Resource
  resourceId?: number
  request?: Partial<Request>
  showSuccessMessages?: boolean
  onFailedSubmission?(values: object, errors: object): void
  formProps?: FormProps
  onStatusChange?(value: string): object
  onSuccessfulSubmission?(response: object): void
  storeManager?: {
    form: FormInstance,
    fields: FieldData[],
    setFields(fields: object): void
  }
  children({ form: FormInstance, status: string }): ReactElement
}

interface Request {
  fetchResource(): void
  createResource(values: object): void
  updateResource(values: object): void
}

const { I18n } = window

const ResourceForm: React.FC<Props> = ({
  resource,
  resourceId,
  resourceName,
  request,
  defaultRequest,
  showSuccessMessages,
  onSuccessfulSubmission,
  onFailedSubmission,
  formProps,
  onStatusChange,
  storeManager,
  children,
}: Props) => {
  const [form] = Form.useForm()
  const [status, setStatus] = useState<string | null>(null)
  const [fields, setFields] = useState<FieldData[] | []>([])

  const store = {
    fields: (storeManager && storeManager.fields) || fields,
    setFields: (storeManager && storeManager.setFields) || setFields,
    form: (storeManager && storeManager.form) || form,
  }

  useEffect(() => {
    if (!isEdit()) { return }

    if (resource) {
      formValuesToField(resource)
    } else {
      handleStatusChange(Status.Loading)
      makeRequest('fetchResource').then(({ response }) => {
        handleStatusChange(Status.Loaded)
        formValuesToField({ ...response })
      })
    }
  }, [])

  const validateMessages = {
    required: I18n.t('validations.blank'),
  }

  const isEdit = () => !!resource || !!resourceId

  const makeRequest = (name: string, ...args) => {
    const requestFunction = (request && request[name]) || defaultRequest[name]
    return requestFunction(...args)
  }

  const saveRequest = (values: object) => {
    const requestName = isEdit() ? 'updateResource' : 'createResource'
    return makeRequest(requestName, values)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    onStatusChange && onStatusChange(value)
  }

  const formValuesToField = (formValues = {}) => {
    const newFields: FieldData[] = []
    _.each(formValues, (value, name: string) => {
      const field: FieldData = _.find(store.fields, { name })
      let newField: FieldData = { name, value }
      if (field) {
        newField = { ...field, value }
      }
      newFields.push(newField)
    })
    store.setFields(newFields)
  }

  const handleSave = async (values: object) => {
    handleStatusChange(Status.Saving)
    saveRequest(values)
      .then((response: object) => {
        handleStatusChange(Status.SaveSuccessful)
        if (showSuccessMessages) {
          message.info(I18n.t(`frontend.${resourceName}.${isEdit() ? 'update' : 'create'}_success`))
        }
        onSuccessfulSubmission && onSuccessfulSubmission(response)
      })
      .catch((errors: Error[]) => {
        onFailedSubmission && onFailedSubmission(values, errors)
        handleStatusChange(Status.SaveFailed)
        handleErrors(errors)
      })
  }

  const handleErrors = (errors: Error[]) => {
    let newFields: FieldData[] = []
    _.each(errors, (error: string | string[], name: string) => {
      const field: FieldData = _.find(store.fields, { name })
      const errors: string[] = _.castArray(error)
      let newField: FieldData = { name, errors }
      if (field) {
        newField = { ...field, errors }
      }
      newFields = [...newFields, newField]
    })
    store.setFields(newFields)
  }

  return (
    <Form
      form={store.form}
      fields={store.fields}
      validateMessages={validateMessages}
      onFinish={handleSave}
      onFieldsChange={(_, allFields) => {
        store.setFields(allFields)
      }}
      layout="vertical"
      {...formProps || {}}
    >
      {children({ form: store.form, status })}
    </Form>
  )
}

export default ResourceForm
