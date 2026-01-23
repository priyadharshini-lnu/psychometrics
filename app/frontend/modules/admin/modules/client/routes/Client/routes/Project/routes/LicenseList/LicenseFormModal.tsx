import React, { useEffect } from 'react'
import {
  Form, InputNumber, Select, Spin, Switch,
} from 'antd'
import { useParams } from 'react-router-dom'
import dayjs from '~/utils/dayjs'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { useResources } from '~/hooks/useResources'
import { License, LicenseTR } from '~/modules/admin/modules/client/core/licenses'

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
        include: ['report_family'],
        filter: { is_project_specific_eq: 'true' },
      },
    },
  )

  const licenseResource = license ? {
    ...license,
    id: license.projectLicenseDetails?.id ?? license.id,
    licenseId: license.id,
    usageLimit: license.projectLicenseDetails?.usageLimit,
    enabled: license.projectLicenseDetails?.enabled,
  } : undefined

  useEffect(() => {
    fetchLicenses()
  }, [])

  return (
    <ResourceFormModal
      resourceName="licenses"
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
            name="licenseId"
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
                      is_project_specific_eq: 'true',
                      report_name_or_type_cont: value,
                    },
                    include: ['report_family'],
                  },
                })
              }}
              notFoundContent={isLicensesLoading('fetch') ? <Spin size="small" /> : null}
              filterOption={false}
            >
              {projectSpecificLicenses.map(({
                id, reportFamily, startDate, endDate, type,
              }) => {
                const hasReportFamilyName = !!reportFamily?.name
                const formattedStartDate = dayjs(startDate).format('DD MMM YYYY')
                const formattedEndDate = dayjs(endDate).format('DD MMM YYYY')
                const dateRange = `(${formattedStartDate} – ${formattedEndDate})`
                const label = hasReportFamilyName
                  ? `${reportFamily.name} ${dateRange}`
                  : `${type} ${dateRange}`

                return (
                  <Select.Option key={id} value={id}>
                    {label}
                  </Select.Option>
                )
              })}
            </Select>
          </Form.Item>


          <Form.Item
            name="usageLimit"
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
