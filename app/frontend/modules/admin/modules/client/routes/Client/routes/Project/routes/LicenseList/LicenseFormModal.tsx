import React, { useEffect } from 'react'
import {
  Form, InputNumber, Select, Spin, Switch,
} from 'antd'
import { useParams } from 'react-router-dom'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { useResources } from '~/hooks/useResources'
import { License, LicenseTR } from '~/modules/admin/modules/client/core/licenses'
import dayjs from 'dayjs'

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
  // debugger;

  const licenseResource = license ? {
    ...license,
    id: license.projectLicenseDetails?.id ?? license.id,
    license_id: license.id,
    usage_limit: license.projectLicenseDetails?.usageLimit,
    enabled: license.projectLicenseDetails?.enabled,
  } : undefined

  useEffect(() => {
    fetchLicenses()
  }, [])

  return (
    <ResourceFormModal
      resourceName="project_licenses"
      readableResourceName="Project License"
      showSuccessMessages
      close={close}
      resource={licenseResource}
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
      {() => (
        <>
          <Form.Item
            name="license_id"
            label={I18n.t('licenses.report_family')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              disabled={!!license}
              onSearch={(value) => {
                fetchLicenses({
                  apiConfig: {
                    filter: {
                      project_specific: 'true',
                      report_name: value,
                    },
                    include: ['report_family'],
                  },
                })
              }}
              notFoundContent={isLicensesLoading('fetch') ? <Spin size="small" /> : null}
              filterOption={false}
            >
              {projectSpecificLicenses.map(({id, reportFamily, startDate, endDate, type}) => {
                const hasReportFamilyName = !!reportFamily?.name;
                const formattedStartDate = dayjs(startDate).format('DD MMM YYYY')
                const formattedEndDate = dayjs(endDate).format('DD MMM YYYY')
                const label = hasReportFamilyName
                  ? reportFamily.name
                  : `${type} (${formattedStartDate} – ${formattedEndDate})`;

                return (
                <Select.Option key={id} value={id}>
                  {label}
                </Select.Option>
              )
              })}
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
