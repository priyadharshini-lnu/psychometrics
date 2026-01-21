import React, { useEffect, useCallback, useMemo } from 'react'
import {
  Modal, Form, Button, Select, Row, Col, Space, Spin,
} from 'antd'
import { ConnectedProps, connect } from 'react-redux'
import debounce from 'lodash/debounce'
import { SearchOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { updateJobRole } from '~/modules/admin/modules/campaigns/core/users'
import { useResources } from '~/hooks/useResources'
import { JobRoleTR, JobRole } from '~/modules/admin/modules/client/core/jobRoles'

interface FormValues {
  currentJobRole?: number
  targetJobRole?: number
}

interface Props extends ConnectedProps<typeof connector> {
  close(): void
  projectId: number
  campaignId: number
  userId: number
  currentJobRole: { id: number, name: string } | null
  targetJobRole: { id: number, name: string } | null
}

const connector = connect(
  null,
  { updateJobRole },
)

const { I18n } = window

export const EditJobRoleFormModalComponent: React.FC<Props> = ({
  close, projectId, campaignId, userId, currentJobRole, targetJobRole, updateJobRole,
}) => {
  const [form] = Form.useForm<FormValues>()
  const {
    data: jobRoles = [], fetch: fetchJobRoles, isLoading: isJobRolesLoading,
  } = useResources<JobRole>('job_roles', {
    responseType: JobRoleTR,
    apiConfig: {
      query: {
        project_id: projectId,
      },
    },
  })

  const debouncedFetchJobRoles = useCallback(
    debounce((value) => {
      fetchJobRoles({
        apiConfig: {
          query: {
            project_id: projectId,
          },
          filter: {
            name_or_code_cont: value,
          },
        },
      })
    }, 300),
    [projectId, fetchJobRoles],
  )

  const jobRoleOptions = useMemo(
    () => jobRoles.map(({ id, name }) => ({
      label: name,
      value: parseInt(id, 10),
    })),
    [jobRoles],
  )

  const handleFinish = (values: FormValues) => {
    updateJobRole(
      campaignId,
      userId,
      values.currentJobRole ?? null,
      values.targetJobRole ?? null,
    )
      .then(() => {
        close()
      })
  }

  useEffect(() => {
    debouncedFetchJobRoles('')
  }, [projectId])

  const handleJobRoleSearch = (value: string) => {
    debouncedFetchJobRoles(value)
  }

  return (
    <Modal
      open
      title={I18n.t('admin.edit_job_roles')}
      onCancel={close}
      footer={
        [
          <Button onClick={close} key="cancel">
            {I18n.t('common.actions.cancel')}
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => form.submit()}
          >
            {I18n.t('common.actions.save')}
          </Button>,
        ]
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form
            form={form}
            onFinish={handleFinish}
            initialValues={{
              currentJobRole: currentJobRole?.id,
              targetJobRole: targetJobRole?.id,
            }}
          >
            <Form.Item
              name="currentJobRole"
              label={I18n.t('admin.current_job_role')}
            >
              <Select
                allowClear
                placeholder={(
                  <Space>
                    <SearchOutlined />
                    {I18n.t('admin.search_job_role')}
                  </Space>
                )}
                showSearch={{
                  onSearch: handleJobRoleSearch,
                  filterOption: false,
                }}
                notFoundContent={isJobRolesLoading('fetch') ? <Spin size="small" /> : null}
                options={jobRoleOptions}
              />
            </Form.Item>
            <Form.Item
              name="targetJobRole"
              label={I18n.t('admin.target_job_role')}
            >
              <Select
                allowClear
                placeholder={(
                  <Space>
                    <SearchOutlined />
                    {I18n.t('admin.search_job_role')}
                  </Space>
                )}
                showSearch={{
                  onSearch: handleJobRoleSearch,
                  filterOption: false,
                }}
                notFoundContent={isJobRolesLoading('fetch') ? <Spin size="small" /> : null}
                options={jobRoleOptions}
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
  )
}

export const EditJobRoleFormModal = connector(EditJobRoleFormModalComponent)
