import React, { useState, useEffect, ReactNode } from 'react'
import {
  Form, App, Alert, GetProp, FormProps,
} from 'antd'
import _ from 'lodash'
import { scrollIntoView } from 'scroll-js'
import { FormInstance } from 'antd/es/form'
import { formDataToResource, resourceToFormData } from '~/libs/jsonApi/helpers'
import { Status } from './constants'
import { PropsFromRedux } from './connect'
import { Resource } from './interfaces'
import FieldsUtil from './FieldsUtil'

type FieldData = GetProp<FormProps, 'fields'>[number]

type Props = PropsFromRedux & OwnProps

interface Error {
  [key: string]: string[]
}

const { I18n } = window

interface Request {
  fetchResource(): void
  createResource(values: object): void
  updateResource(values: object): void
  submit(values: object): Promise<unknown>
}

interface JSONApiError {
  title: string
  detail?: string
}

export type ChildrenProps = {
  form: FormInstance, status: string | null, isEdit: boolean, fieldsUtil: FieldsUtil
}

export type OwnProps = {
  resourceName: string
  resourceBaseUrl?: string,
  readableResourceName?: string
  requestScope?: string
  resource?: Resource
  resourceId?: number | string
  request?: Partial<Request>
  submitRequest?: (values: object) => Promise<unknown>
  showSuccessMessages?: boolean
  onFailedSubmission?(values: object, errors: object): void
  formProps?: FormProps
  onStatusChange?(value: string): void
  onSuccessfulSubmission?(response: object, values?: object): void
  transformValues?(values: Record<string, unknown>): Record<string, unknown>
  storeManager?: {
    form?: FormInstance,
    fields?: FieldData[],
    setFields?(fields: object): void
  }
  children(props: ChildrenProps): ReactNode
  scrollToFirstError?: boolean
  focusOnFirstError?: boolean
  mockRequest?: boolean
  nullifyEmptyString?: boolean
  style?: React.CSSProperties
}

const ResourceForm: React.FC<Props> = ({
  resource,
  resourceId,
  resourceName,
  readableResourceName,
  request,
  defaultRequest,
  showSuccessMessages,
  onSuccessfulSubmission,
  onFailedSubmission,
  formProps,
  onStatusChange,
  storeManager,
  children,
  transformValues,
  scrollToFirstError,
  // eslint-disable-next-line max-len
  // TODO: try antd's built-in feature after upgrade(>=v5.22.0) https://github.com/ant-design/ant-design/releases/tag/5.22.0
  focusOnFirstError = true,
  nullifyEmptyString,
  style,
}: Props) => {
  const baseErrorRef = React.createRef<HTMLDivElement>()
  const [form] = Form.useForm()
  const [status, setStatus] = useState<string | null>(null)
  const [fields, setFields] = useState<FieldData[] | []>([])
  const [baseErrors, setBaseErrors] = useState<string[] | JSONApiError[]>()
  const { message } = App.useApp()

  const store = {
    fields: (storeManager && storeManager.fields) || fields,
    setFields: (storeManager && storeManager.setFields) || setFields,
    form: (storeManager && storeManager.form) || form,
  }

  useEffect(() => {
    if (!isEdit()) {
      formValuesToField(form.getFieldsValue())
      return
    }
    if (resource) {
      formValuesToField(resourceToFormData(resource, resourceName))
    } else {
      handleStatusChange(Status.Loading)
      makeRequest('fetchResource').then(({ response }) => {
        handleStatusChange(Status.Loaded)
        formValuesToField(resourceToFormData(response, resourceName))
      })
    }
  }, [])

  useEffect(() => {
    if (baseErrorRef.current && scrollToFirstError && !_.isEmpty(baseErrors)) {
      let element = document.getElementsByClassName('ant-modal-wrap')[0]
      // eslint-disable-next-line prefer-destructuring
      if (!element) { element = document.getElementsByClassName('resourceForm')[0] }

      scrollIntoView(baseErrorRef.current, element, { behavior: 'smooth' })
    }
  }, [baseErrors])

  const validateMessages = {
    required: I18n.t('validations.blank'),
  }

  const isEdit = () => !!resource || !!resourceId
  const operation = () => (isEdit() ? 'update' : 'create')

  const makeRequest = (name: string, ...args) => {
    const requestFunction = (request && request[name]) || defaultRequest[name]
    return requestFunction(...args)
  }

  const saveRequest = (values: Record<string, unknown>) => {
    if (request?.submit) { return request.submit(values) }

    const requestName = isEdit() ? 'updateResource' : 'createResource'
    if (isEdit()) { values = { ...values, id: resourceId || resource?.id } }

    return makeRequest(requestName, formDataToResource(values, resourceName))
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    onStatusChange && onStatusChange(value)
  }

  const formValuesToField = (formValues = {}) => {
    const newFields: FieldData[] = []
    _.each(formValues, (value: string, name: string) => {
      const field = _.find(store.fields, { name })
      let newField: FieldData = { name, value }

      if (field) { newField = { ...field, value } }

      newFields.push(newField)
    })
    store.setFields(newFields)
  }

  const handleSave = async (values: Record<string, unknown>) => {
    let transformedValues = values
    if (nullifyEmptyString) {
      transformedValues = _.transform(transformedValues, (result, value, key) => {
        result[key] = value === '' ? null : value
      }, {})
    }
    if (transformValues) {
      transformedValues = transformValues(transformedValues)
    }
    setBaseErrors([])
    handleStatusChange(Status.Saving)
    saveRequest(transformedValues)
      .then((response: object) => {
        handleStatusChange(Status.SaveSuccessful)
        if (showSuccessMessages) {
          let messageText = I18n.lookup(`frontend.${resourceName}.${operation()}_success`)
          const readableResourceText = readableResourceName || _.capitalize(resourceName)
          messageText = messageText
            || I18n.t(`frontend.resource.${operation()}_success`, { readableResourceName: readableResourceText })
          message.success(messageText)
        }
        removeErrors()
        onSuccessfulSubmission && onSuccessfulSubmission(response, values)
      })
      .catch((errors: Error) => {
        onFailedSubmission && onFailedSubmission(values, errors)
        setBaseErrors(errors.base)
        handleStatusChange(Status.SaveFailed)
        handleErrors(errors)
      })
  }

  const removeErrors = () => {
    const newFields = store.fields.map(field => (
      { ...field, errors: undefined }
    ))
    store.setFields(newFields)
  }

  const displayableError = (error: string | string[] | JSONApiError | JSONApiError[]) => (
    [error].flat().map((e: string | JSONApiError) => {
      if (_.isString(e)) return e

      return e.title || e.detail
    }) as string[]
  )

  const focusFormField = (field: FieldData) => {
    if (!focusOnFirstError) return
    const namePath = field.name
    store.form.getFieldInstance(namePath)?.focus()
  }

  const handleErrors = (errors: Error) => {
    let newFields: FieldData[] = []
    let foundFirstError = false
    newFields = store.fields.map((field) => {
      const { name } = field
      const fieldNameStringFormat = typeof (name) === 'string' ? name : name.join('/')
      const displayableErrors = errors[fieldNameStringFormat] ? displayableError(errors[fieldNameStringFormat]) : []
      if (errors[fieldNameStringFormat] && !foundFirstError) {
        focusFormField(field)
        foundFirstError = true
      }
      return ({ ...field, errors: displayableErrors })
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
      scrollToFirstError={scrollToFirstError}
      layout="vertical"
      initialValues={resource || undefined}
      {...formProps || {}}
      className="resourceForm"
      style={style}
    >
      {!_.isEmpty(baseErrors) && baseErrors !== undefined
        && (
          <div ref={baseErrorRef}>
            {displayableError(baseErrors).map(error => (
              <Alert
                message={false}
                description={error}
                type="error"
                className="mbm"
                showIcon
              />
            ))}
          </div>
        )}
      {children({
        form: store.form, status, isEdit: isEdit(), fieldsUtil: new FieldsUtil(store.fields),
      })}
    </Form>
  )
}

export default ResourceForm
