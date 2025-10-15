import React from 'react'
import { Form, InputNumber, Select, Spin, Switch} from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { useResources } from '~/hooks/useResources'
import { License, LicenseTR } from '../../../../../../core/licenses'
import { useParams } from 'react-router-dom'

const { I18n } = window

interface Props {
  close(): void,
  license: License
}

interface LicenseFormValues extends Omit<License, 'startDate' | 'endDate'> {
  usageLimit: number
}

export const LicenseFormModal: React.FC<Props> = ({ close, license }) => {
  const { resource } = useResourceContext()
  const { projectId } = useParams() as { projectId: string }

  const {
  data: projectSpecificLicenses,
  fetch: fetchLicenses,
  isLoading: isLicensesLoading,
} = useResources<License>(
  `projects/${projectId}/licenses`,
  {
    responseType: LicenseTR,
    apiConfig: {
      fields: { licenses: ['id', 'number', 'report_family'] },
      include: ['report_family'],
      filter: { project_specific: 'true' },
    },
  },
)

  return (
    <ResourceFormModal
      resourceName="project_licenses"
      readableResourceName="Project License"
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      transformValues={(values: LicenseFormValues) => ({
        ...values,
      })}
      request={{
        createResource: resource.createResource,
        updateResource: resource.updateResource,
      }}
    >
      {({ form }) => (
        <>
        <Form.Item
          name="license_id"
          label={I18n.t('licenses.project_specific')}
          rules={[{ required: true }]}
        >
          <Select
            showSearch
            onSearch={(value) => {
              fetchLicenses({
                apiConfig: {
                  filter: {
                    is_project_specific_true: 'true',
                    number_cont: value,
                  },
                  include: ['report_family'],
                },
              })
            }}
            notFoundContent={isLicensesLoading('fetch') ? <Spin size="small" /> : null}
            filterOption={false}
          >
            {projectSpecificLicenses.map(({ id, number, reportFamily }) => (
              <Select.Option key={id} value={id}>
                {`${reportFamily?.name || 'N/A'}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>





          <Form.Item
            name="usage_limit"
            label={I18n.t('licenses.number')}
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '25%' }} />
          </Form.Item>

          <Form.Item
            name="enabled"
            label={I18n.t('licenses.enabled')}
            initialValue
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
