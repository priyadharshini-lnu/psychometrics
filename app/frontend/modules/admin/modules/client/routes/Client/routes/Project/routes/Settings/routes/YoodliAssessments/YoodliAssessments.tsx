import React, { useEffect, useState } from 'react'
import {
  Table, Pagination, Space, Typography, Input, Button, Modal, Form, Popconfirm, message,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { useResources } from '~/hooks/useResources/useResources'
import {
  YoodliAssessments as YoodliAssessmentsType, YoodliAssessment,
} from '~/modules/admin/modules/client/core/yoodliAssessments'
import settings from '~/modules/admin/modules/client/routes/Client/routes/Project/settings'
import routeUtils from '~/utils/route'
import { DirectionalNavigateBackIcon } from '~/glint'

const { I18n } = window
const { Column } = Table

export const YoodliAssessments: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const {
    data, meta, fetch, isLoading, changePage, createResource, updateResource, removeResource,
    currentPage, pageSize, getSortOrder, handleTableChange, requests, getFilteredValue, changeFilter,
  } = useResources<YoodliAssessmentsType>(
    'yoodli_assessments',
    {
      basePath: `projects/${projectId}`,
      trackUrl: true,
    },
  )

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState<YoodliAssessment | null>(null)
  const [form] = Form.useForm()

  const tableLoading = isLoading('fetch')
  const navigate = useNavigate()
  const prefix = `${settings.urlPrefix}/:projectId/settings`

  const handleTabChange = (currentTab: string) => {
    routeUtils.moveTo(navigate, prefix, `/${currentTab}`)
  }

  useEffect(() => {
    fetch()
  }, [])

  const handleAdd = () => {
    setEditingAssessment(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (assessment: YoodliAssessment) => {
    setEditingAssessment(assessment)
    form.setFieldsValue({
      name: assessment.name,
      product_id: assessment.productId,
    })
    setIsModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await removeResource(id)
      message.success(I18n.t('administration.integrations.yoodli_assessments.messages.delete_success'))
      fetch()
    } catch (error) {
      message.error(I18n.t('common.messages.error'))
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editingAssessment) {
        await updateResource({
          id: editingAssessment.id,
          name: values.name,
          productId: values.product_id,
        })
        message.success(
          I18n.t('administration.integrations.yoodli_assessments.messages.update_success', { name: values.name }),
        )
      } else {
        await createResource({
          name: values.name,
          productId: values.product_id,
        })
        message.success(
          I18n.t('administration.integrations.yoodli_assessments.messages.create_success', { name: values.name }),
        )
      }

      setIsModalVisible(false)
      fetch()
    } catch (error) {
      console.error('Failed to save:', error)
    }
  }

  const YoodliAssessmentsTable = (
    <>
      <Table
        dataSource={data}
        loading={tableLoading}
        onChange={handleTableChange}
        pagination={false}
        rowKey="id"
      >
        <Column
          title={I18n.t('common.column.id')}
          dataIndex="id"
          key="id"
          sorter
          sortOrder={getSortOrder('id')}
        />
        <Column
          title={I18n.t('administration.integrations.yoodli_assessments.columns.name')}
          dataIndex="name"
          key="name"
          sorter
          sortOrder={getSortOrder('name')}
        />
        <Column
          title={I18n.t('administration.integrations.yoodli_assessments.columns.product_id')}
          dataIndex="productId"
          key="productId"
          sorter
          sortOrder={getSortOrder('product_id')}
        />
        <Column
          title={I18n.t('administration.integrations.yoodli_assessments.columns.created_at')}
          dataIndex="createdAt"
          key="createdAt"
          sorter
          sortOrder={getSortOrder('created_at')}
        />
        <Column
          title={I18n.t('administration.integrations.yoodli_assessments.columns.actions')}
          key="actions"
          render={(_, record: YoodliAssessment) => (
            <Space size="small">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                {I18n.t('common.actions.edit')}
              </Button>
              <Popconfirm
                title={I18n.t('administration.integrations.yoodli_assessments.delete_confirm')}
                onConfirm={() => handleDelete(record.id)}
                okText={I18n.t('common.actions.yes')}
                cancelText={I18n.t('common.actions.no')}
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                >
                  {I18n.t('common.actions.delete')}
                </Button>
              </Popconfirm>
            </Space>
          )}
        />
      </Table>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={meta?.recordCount || 0}
        onChange={changePage}
        className="pl"
      />
    </>
  )

  const Filter = (
    <Space>
      <Input.Search
        placeholder={I18n.t('administration.integrations.yoodli_assessments.search')}
        value={getFilteredValue('filterable_fields')}
        onChange={e => changeFilter('filterable_fields', e.target.value)}
      />
      <Button
        icon={<PlusOutlined />}
        type="primary"
        disabled={tableLoading}
        onClick={handleAdd}
      >
        {I18n.t('administration.integrations.yoodli_assessments.add_assessment')}
      </Button>
    </Space>
  )

  return (
    <div style={{ padding: 20 }}>
      <Space>
        <DirectionalNavigateBackIcon onClick={() => handleTabChange('integrations')} />
        <Typography.Title level={5}>
          {I18n.t('administration.integrations.actions.back')}
        </Typography.Title>
      </Space>

      <TableLayout
        table={YoodliAssessmentsTable}
        filters={Filter}
        recordCount={meta.recordCount}
        requestStatus={requests.fetch?.status}
        loading={tableLoading}
      />

      <Modal
        title={editingAssessment
          ? I18n.t('administration.integrations.yoodli_assessments.edit_assessment')
          : I18n.t('administration.integrations.yoodli_assessments.add_assessment')
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={I18n.t('common.actions.save')}
        cancelText={I18n.t('common.actions.cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={I18n.t('administration.integrations.yoodli_assessments.columns.name')}
            name="name"
            rules={[{ required: true, message: I18n.t('common.validations.required') }]}
          >
            <Input placeholder={I18n.t('administration.integrations.yoodli_assessments.placeholders.name')} />
          </Form.Item>
          <Form.Item
            label={I18n.t('administration.integrations.yoodli_assessments.columns.product_id')}
            name="product_id"
            rules={[{ required: true, message: I18n.t('common.validations.required') }]}
          >
            <Input placeholder={I18n.t('administration.integrations.yoodli_assessments.placeholders.product_id')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
