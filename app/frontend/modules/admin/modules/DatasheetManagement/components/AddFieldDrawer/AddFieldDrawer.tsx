import React, { FC, useState } from 'react'
import {
  Button,
  Col,
  Drawer,
  Row,
  Space,
  Input,
  Form,
  Select,
  Switch,
  message,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'

import { RootState } from 'modules/admin/core/rootReducers'
import { ParentResourceType } from 'modules/admin/modules/DatasheetManagement/interfaces'
import {
  saveColumn,
  get as getColumns,
} from 'modules/admin/modules/DatasheetManagement/core/columnDefinitions'
import { Column } from 'modules/admin/modules/DatasheetManagement/core/list'
import {
  getCurrent,
  fetchSingle,
} from 'modules/admin/modules/DatasheetManagement/core/current'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    columnDefinitions: getColumns(state),
    datasheetDetails: getCurrent(state),
  }),
  {
    fetchSingle,
    add: saveColumn,
  },
)

interface OwnProps {
  isOpen: boolean
  toggleDrawer: () => void
  parentResourceType: ParentResourceType
  parentResourceId: number
}

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = OwnProps & PropsFromRedux

const AddFieldDrawerComponent: FC<Props> = ({
  isOpen,
  toggleDrawer,
  add,
  parentResourceType,
  parentResourceId,
}) => {
  const [form] = Form.useForm()
  const [errors, setErrors] = useState<{name?: string}>({})

  const handleFormSubmit = async (
    values: Column,
  ): Promise<void> => {
    try {
      await add(parentResourceType, parentResourceId, values)
      message.success(
        I18n.t('administration.datasheets.drawers.add_edit.success_message_add'),
      )
      closeDrawer()
    } catch (e) {
      setErrors(e)
    }
  }

  const closeDrawer = (): void => {
    form.resetFields()
    toggleDrawer()
  }

  const datasheetFormValues: Record<string, string | boolean | null> = {
    type: 'String',
    accessorAccess: true,
    dashboardUse: true,
    visibleInList: true,
  }

  return (
    <Drawer
      title={I18n.t('administration.datasheets.drawers.add_edit.title_add')}
      placement="right"
      closable={false}
      visible={isOpen}
      width="30%"
      zIndex={1001}
      maskClosable={false}
    >
      <Row justify="space-between" align="middle" className="mb-2">
        <Col>
          <Space>
            <Button htmlType="reset" onClick={closeDrawer}>
              {I18n.t('administration.datasheets.drawers.add_edit.cancelText')}
            </Button>
            <Button
              htmlType="submit"
              form="add_field_form"
              type="primary"
            >
              {I18n.t('administration.datasheets.column.add_column')}
            </Button>
          </Space>
        </Col>
      </Row>
      <Form
        name="add_field_form"
        form={form}
        layout="vertical"
        scrollToFirstError
        onFinish={handleFormSubmit}
        initialValues={datasheetFormValues}
      >
        <Form.Item
          label="Name"
          name="name"
          key="name"
          help={errors.name}
          validateStatus={errors.name ? 'error' : 'success'}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Type" name="type" key="type">
          <Select placeholder="Select type...">
            <Select.Option value="String">String</Select.Option>
            <Select.Option value="Number">Number</Select.Option>
            <Select.Option value="Text">Text</Select.Option>
            <Select.Option value="HTML">HTML</Select.Option>
            <Select.Option value="Markdown">Markdown</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          valuePropName="checked"
          label={I18n.t('activemodel.attributes.datasheet_column.accessor_access')}
          name="accessorAccess"
          key="accessorAccess"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          valuePropName="checked"
          label={I18n.t('activemodel.attributes.datasheet_column.dashboard_use')}
          name="dashboardUse"
          key="dashboardUse"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          valuePropName="checked"
          label={I18n.t('activemodel.attributes.datasheet_column.visible_in_list')}
          name="visibleInList"
          key="visibleInList"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Drawer>
  )
}

export const AddFieldDrawer = connector(AddFieldDrawerComponent)
