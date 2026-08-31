import React, { useState } from 'react'
import { Form, Select, Spin } from 'antd'
import debounce from 'lodash/debounce'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { Report, HoganReportPackages } from '~/modules/admin/modules/client/core/reports'
import { useResources } from '~/hooks/useResources'

interface Props {
  close(): void
  parent?: { id: string, tenantId?: string }
}

const { I18n } = window

export const ReportBundleReportFormModal: React.FC<Props> = ({ close, parent }) => {
  const { resource } = useResourceContext()
  const [form] = Form.useForm()
  const [hoganPackages, setHoganPackages] = useState<HoganReportPackages | []>([])

  const {
    data: reports, fetch: fetchReports, isLoading: isReportLoading,
  } = useResources<Report>('reports')

  const debouncedFetchReports = debounce((value: string) => {
    const tenantId = (parent && parent.tenantId) || undefined
    const filter: Record<string, string> = { filterable_fields: value, category_eq: 'common' }
    if (tenantId) filter.tenant_id = tenantId

    fetchReports({
      apiConfig: {
        filter,
        fields: { reports: ['name', 'hogan_report_packages'] },
      },
    })
  }, 300)

  const handleReportSelect = (reportId: string) => {
    const selectedReport = reports.find(report => report.id === reportId)

    setHoganPackages(selectedReport?.hoganReportPackages || [])
  }

  return (
    <ResourceFormModal
      resourceName="report_families_reports"
      readableResourceName={I18n.t('reports.reports')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{
        createResource: resource.createResource,
      }}
    >
      {() => (
        <>
          <Form.Item
            name="reportId"
            label={I18n.t('common.column.report')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch={{ filterOption: false, onSearch: debouncedFetchReports }}
              onChange={handleReportSelect}
              notFoundContent={isReportLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
              options={reports.map(({ id, name }) => ({
                label: name,
                value: id,
              }))}
            />
          </Form.Item>
          {hoganPackages.length > 0 && (
            <Form.Item
              name="externalPackageId"
              label={I18n.t('common.column.package_id')}
            >
              <Select>
                {hoganPackages.map(({ id, name }) => (
                  <Select.Option key={id} value={id}>{name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </>
      )}
    </ResourceFormModal>
  )
}
