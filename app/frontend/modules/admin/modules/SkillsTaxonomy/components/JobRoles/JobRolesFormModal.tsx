import React, { useCallback } from 'react'
import {
  Form, Input, Select,
  Spin,
} from 'antd'
import { useParams } from 'react-router-dom'
import { debounce } from 'lodash'
import { useResources } from '~/hooks/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'
import { JobRole } from '~/modules/admin/modules/client/core/jobRoles'
import { JobGroup } from '~/modules/admin/modules/client/core/jobGroups'
import { ApiConfig } from '~/hooks/useResources/interfaces'

type Props = {
  close(): void
  jobRole: JobRole
}

const { I18n } = window

export const JobRolesFormModal: React.FC<Props> = ({ close, jobRole }) => {
  const params = useParams()

  const { resource } = useResourceContext<JobRole>()
  const [form] = Form.useForm()

  const {
    data: jobGroups,
    fetch: fetchJobGroups, isLoading: isJobGroupsLoading,
  } = useResources<JobGroup>('job_groups', {
    apiConfig: {
      filter: {
        end_level_groups: 'true',
      },
      ...(params?.projectId ? { project_id: params?.projectId } : {}),
    } as ApiConfig,
  })

  const getJobGroups = (): JobGroup[] => {
    if (!jobGroups?.length && jobRole?.jobGroup) {
      return [jobRole.jobGroup]
    }
    return jobGroups
  }

  const debouncedFetchJobGroups = useCallback(debounce((value) => {
    fetchJobGroups({
      apiConfig: {
        filter: {
          name_cont: value,
          ...(
            params.projectid ? { project_id: params.projectid } : {}
          ),
        },
      },
    })
  }, 300), [params.projectId])

  const transformValues = values => ({
    ...values,
    project_id: (params.projectId || values.projectId)
      ? Number(params.projectId || values.projectId)
      : undefined,
    job_group_id: Number(values.jobGroupId),
  })

  return (
    <ResourceFormModal
      resourceName="jobRole"
      resource={jobRole ? transformValues(jobRole) : undefined}
      readableResourceName={I18n.t('admin.job_role_form_title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: resource.createResource, updateResource: resource.updateResource }}
      transformValues={transformValues}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="code"
            label={I18n.t('shared.code')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label={I18n.t('shared.description')}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="jobGroupId"
            label={I18n.t('admin.job_role_form_job_group')}
          >
            <Select
              showSearch={{ filterOption: false, onSearch: debouncedFetchJobGroups }}
              allowClear
              loading={isJobGroupsLoading('fetch')}
              notFoundContent={isJobGroupsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
              options={getJobGroups().map(p => ({
                value: p.id,
                label: p.name,
              }))}
            />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
