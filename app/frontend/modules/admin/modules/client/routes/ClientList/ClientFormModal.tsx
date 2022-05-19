import React, { FC, ReactElement, useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Form, FormInstance, FormProps, Input, Modal, Select,
} from 'antd'
import _ from 'lodash'
import { Client } from '../../core/clients'
import { AddResource } from 'hooks/useResources/interfaces'
import { FieldData } from 'rc-field-form/lib/interface'
import { Resource } from 'modules/admin/modules/client/core/resource'
import ResourceFormModal from 'components/ResourceFormModal'
import { useResources } from 'hooks/useResources'

// interface Request {
//   fetchResource(): void
//   createResource(values: object): void
//   updateResource(values: object): void
//   submit(values: object): void
// }

// export type OwnProps = {
//   resourceName: string
//   resourceBaseUrl?: string,
//   readableResourceName?: string
//   requestScope?: string
//   resource?: Resource
//   resourceId?: number
//   request?: Partial<Request>
//   showSuccessMessages?: boolean
//   onFailedSubmission?(values: object, errors: object): void
//   formProps?: FormProps
//   onStatusChange?(value: string): void
//   onSuccessfulSubmission?(response: object): void
//   transformValues?(values: object): object
//   storeManager?: {
//     form?: FormInstance,
//     fields?: FieldData[],
//     setFields?(fields: object): void
//   }
//   children({
//     form: FormInstance, status: string, isEdit: boolean,
//   }): ReactElement
//   scrollToFirstError?: boolean
//   mockRequest?: boolean,
//   updateResource: any
//   addResource: any
// }


// export const ResourceForm: FC<OwnProps> = ({
//   storeManager, scrollToFirstError, formProps, children, resource, resourceId, transformValues, request,
//   addResource, updateResource,
// }) => {
//   const baseErrorRef = React.createRef<HTMLDivElement>()
//   const [form] = Form.useForm()
//   const [status, setStatus] = useState<string | null>(null)
//   const [fields, setFields] = useState<FieldData[] | []>([])
//   const [baseErrors, setBaseErrors] = useState<string[]>()

//   useEffect(() => {
//     if (!isEdit()) { return }

//     if (resource) {
//       formValuesToField(resource)
//     } else {
//       handleStatusChange(Status.Loading)
//       makeRequest('fetchResource').then(({ response }) => {
//         handleStatusChange(Status.Loaded)
//         formValuesToField({ ...response })
//       })
//     }
//   }, [])

//   const store = {
//     fields: (storeManager && storeManager.fields) || fields,
//     setFields: (storeManager && storeManager.setFields) || setFields,
//     form: (storeManager && storeManager.form) || form,
//   }

//   const validateMessages = {
//     required: I18n.t('validations.blank'),
//   }

//   const isEdit = () => !!resource || !!resourceId
//   const operation = () => (isEdit() ? 'update' : 'create')

//   const formValuesToField = (formValues = {}) => {
//     const newFields: FieldData[] = []
//     _.each(formValues, (value, name: string) => {
//       const field = _.find(store.fields, { name })
//       let newField: FieldData = { name, value }
//       if (field) {
//         newField = { ...field, value }
//       }
//       newFields.push(newField)
//     })
//     store.setFields(newFields)
//   }

//   const handleSave = (values) => {
//     if (transformValues) {
//       values = transformValues(values)
//     }
//     (isEdit() ? updateResource(values) : addResource(values)).then(() => {

//     }).catch((error) => {
//     })
//   }


//   return (
//     <Form
//       form={store.form}
//       fields={store.fields}
//       validateMessages={validateMessages}
//       onFinish={handleSave}
//       onFieldsChange={(_, allFields) => {
//         store.setFields(allFields)
//       }}
//       scrollToFirstError={scrollToFirstError}
//       layout="vertical"
//       {...formProps || {}}
//       className="resourceForm"
//     >
//       {!_.isEmpty(baseErrors)
//         && (
//           <div ref={baseErrorRef}>
//             <Alert
//               message={false}
//               description={_.join(_.castArray(baseErrors), ',')}
//               type="error"
//               className="mbm"
//               showIcon
//             />
//           </div>
//         )}
//       {children({
//         form: store.form, status, isEdit: isEdit()
//       })}
//     </Form>
//   )
// }

const { I18n } = window

interface Props {
  client: undefined
  addClient: AddResource<Client>
  close(): void
}

export const ClientFormModal: React.FC<Props> = ({
  client,
  addClient,
  close,
}) => {
  const [form] = Form.useForm()
  useEffect(() => {

  }, [])

  const handleValuesChange = (changedValues: object, allValues: { status, startDate, endDate }) => {

  }

  const handleSave = (values) => {
    console.log(values)
    addClient({...values, accountManagerId: 100})
  }

  return (
    <ResourceFormModal
      resourceName="clients"
      readableResourceName="Client"
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      request={{
        createResource: addClient
      }}

    >
      {({}) => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('administration.campaigns.form.name')}
            // rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="number"
            label="Number"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="country"
            label="Country"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="year"
            label="Year"
          >
            <Select>
              {[2000, 2001].map(year => (<Select.Option key={year} value={year}>{year}</Select.Option>))}
            </Select>
          </Form.Item>
          <Form.Item
            name="accountManagerId"
            label="Account Manager"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="projectManagerId"
            label="Project Manager"
          >
            <Input />
          </Form.Item>
        </>
  )}
    </ResourceFormModal>
    // <Modal
    //   width={650}
    //   title={"form"}
    //   visible
    //   onCancel={close}
    //   footer={[
    //     <Button key="back" onClick={close}>
    //       Cancel
    //     </Button>,
    //     <Button
    //       key="submit"
    //       type="primary"
    //       onClick={() => form.submit()}
    //     >
    //       Add
    //     </Button>,
    //   ]}
    // >
    //   <Form
    //     form={form}
    //     onValuesChange={handleValuesChange}
    //     onFinish={handleSave}
    //   >
    //     <Form.Item
    //       name="name"
    //       label={I18n.t('administration.campaigns.form.name')}
    //       rules={[{ required: true }]}
    //     >
    //       <Input />
    //     </Form.Item>
    //   </Form>
    // </Modal>
  )
}
