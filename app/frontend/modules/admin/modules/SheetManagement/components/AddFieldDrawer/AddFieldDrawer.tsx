import { FC, useState } from 'react'
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
  App,
  Tooltip,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { RootState } from '~/modules/admin/core/rootReducers'
import { ParentResourceType } from '~/modules/admin/modules/SheetManagement/interfaces'
import {
  saveColumn,
  get as getColumns,
  MAX_LENGTH_FOR_DASHBOARD_USE,
} from '~/modules/admin/modules/SheetManagement/core/columnDefinitions'
import { Column, SheetType } from '~/modules/admin/modules/SheetManagement/core/list'
import {
  getCurrent,
  fetchSingle,
} from '~/modules/admin/modules/SheetManagement/core/current'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    columnDefinitions: getColumns(state),
    sheetDetails: getCurrent(state),
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
  sheetType: SheetType
}

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = OwnProps & PropsFromRedux

const AddFieldDrawerComponent: FC<Props> = ({
  isOpen,
  toggleDrawer,
  add,
  parentResourceType,
  parentResourceId,
  sheetType,
}) => {
  const [form] = Form.useForm()
  const [errors, setErrors] = useState<{name?: string}>({})
  const [name, setName] = useState('')
  const { message } = App.useApp()
  const allowedForDashboardUse = name.length <= MAX_LENGTH_FOR_DASHBOARD_USE

  const handleFormSubmit = async (
    values: Column,
  ): Promise<void> => {
    try {
      await add(parentResourceType, parentResourceId, sheetType, values)
      message.success(
        I18n.t('admin.sheets_drawers_add_edit_success_message_add'),
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

  const sheetColumnFormValues: Record<string, string | boolean | null> = {
    columnType: 'string',
    accessorAccess: true,
    dashboardUse: true,
    visibleInList: true,
  }

  return (
    <Drawer
      title={I18n.t('admin.sheets_drawers_add_edit_title_add')}
      placement="right"
      closable={false}
      open={isOpen}
      width="30%"
      zIndex={1001}
      maskClosable={false}
    >
      <Row justify="space-between" align="middle" className="mb-2">
        <Col>
          <Space>
            <Button htmlType="reset" onClick={closeDrawer}>
              {I18n.t('shared.cancel')}
            </Button>
            <Button
              htmlType="submit"
              form="add_field_form"
              type="primary"
            >
              {I18n.t('admin.sheets_column_add_column')}
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
        initialValues={sheetColumnFormValues}
      >
        <Form.Item
          label="Name"
          name="name"
          key="name"
          help={errors.name}
          validateStatus={errors.name ? 'error' : 'success'}
          rules={[
            { required: true, message: 'Column name is required' },
          ]}
        >
          <Input name="sheet_name" onChange={({ target: { value } }) => setName(value)} />
        </Form.Item>
        <Form.Item label="Type" name="columnType" key="columnType">
          <Select placeholder="Select type...">
            <Select.Option value="string">String</Select.Option>
            <Select.Option value="number">Number</Select.Option>
            <Select.Option value="text">Text</Select.Option>
            <Select.Option value="html">HTML</Select.Option>
            <Select.Option value="markdown">Markdown</Select.Option>
          </Select>
        </Form.Item>
        {sheetType === SheetType.Datasheet
          && (
            <>
              <Form.Item
                valuePropName="checked"
                label={I18n.t('activemodel.attributes.sheet_column.accessor_access')}
                name="accessorAccess"
                key="accessorAccess"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                label={I18n.t('activemodel.attributes.sheet_column.dashboard_use')}
                name="dashboardUse"
                key="dashboardUse"
              >
                <Switch disabled={!allowedForDashboardUse} checked={allowedForDashboardUse} />
                {!allowedForDashboardUse && (
                  <Tooltip placement="top" title={I18n.t('admin.sheets_column_not_allowed_for_dashboard_use')}>
                    <span><InfoCircleOutlined className="ms-2" /></span>
                  </Tooltip>
                )}
              </Form.Item>
            </>
          )}
        <Form.Item
          valuePropName="checked"
          label={I18n.t('activemodel.attributes.sheet_column.visible_in_list')}
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
