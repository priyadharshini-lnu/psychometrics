import React from 'react'
import {
  Form, DatePicker, InputNumber, Select, Spin,
  Switch,
} from 'antd'
import { useParams } from 'react-router-dom'
import dayjs from '~/utils/dayjs'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { useResources } from '~/hooks/useResources'
import { ReportFamily, ReportFamilyTR } from '../../core/reportFamilies'
import { License, LicenseTypes } from '../../core/licenses'

const { I18n } = window

interface Props {
  close(): void,
  license: License
}

interface LicenseFormValues extends Omit<License, 'startDate' | 'endDate'> {
  startDate: dayjs.Dayjs
  endDate: dayjs.Dayjs
}

export const LicenseFormModal: React.FC<Props> = ({ close, license }) => {
  const { resource } = useResourceContext()
  const { clientId } = useParams() as { clientId: string }
  const {
    data: reportFamilies, fetch: fetchReportFamilies, isLoading: isReportFamilyLoading,
  } = useResources<ReportFamily>(
    'report_families',
    {
      responseType: ReportFamilyTR,
      apiConfig: {
        fields: { report_families: ['id', 'name'] },
      },
    },
  )
  const reportFamilyOpts = license?.reportFamily ? reportFamilies.concat(license.reportFamily) : reportFamilies

  const datePicketDateFormat = 'DD MMMM YYYY'
  const requestResponseDateFormat = 'YYYY-MM-DD'
  const licenseResource = license ? {
    ...license,
    startDate: dayjs(license.startDate, requestResponseDateFormat),
    endDate: dayjs(license.endDate, requestResponseDateFormat),
  } : undefined

  return (
    <ResourceFormModal
      resourceName="licenses"
      readableResourceName={I18n.t('licenses.title')}
      showSuccessMessages
      close={close}
      resource={licenseResource}
      scrollToFirstError
      modalProps={{ width: 620 }}
      transformValues={(values: LicenseFormValues) => (
        {
          ...values,
          startDate: values.startDate.format(requestResponseDateFormat),
          endDate: values.endDate.format(requestResponseDateFormat),
          overuseNumber: values.overuseNumber || 0,
        })

      }
      request={{
        createResource: resource.createResource,
        updateResource: resource.updateResource,
      }}
    >
      {({ form }) => (
        <>
          <Form.Item
            name="type"
            label={I18n.t('licenses.type')}
            rules={[{ required: true }]}
          >
            <Select showSearch disabled={!!license}>
              {LicenseTypes.map(type => (
                <Select.Option key={type} value={type}>
                  { I18n.t(`licenses.types.${type}`) }
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          { form.getFieldValue('type') === 'common' && (
            <Form.Item
              name="reportFamilyId"
              label={I18n.t('licenses.report_family')}
              rules={[{ required: form.getFieldValue('type') === 'common' }]}
            >
              <Select
                showSearch={{
                  filterOption: false,
                  onSearch: (value) => {
                    fetchReportFamilies({
                      apiConfig: {
                        fields: { report_families: ['id', 'name'] },
                        filter: { name_cont: value, owner_id: clientId },
                      },
                    })
                  },
                }}
                disabled={!!license}
                notFoundContent={
                  isReportFamilyLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')
                }
              >
                {reportFamilyOpts.map(({ id, name }) => (
                  <Select.Option key={id} value={id}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="isProjectSpecific"
            label={I18n.t('licenses.project_specific_license')}
            valuePropName="checked"
          >
            <Switch disabled={!!license} />
          </Form.Item>

          <Form.Item
            name="number"
            label={I18n.t('licenses.number')}
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '25%' }} />
          </Form.Item>

          {
            form.getFieldValue('isProjectSpecific') !== true && (
              <Form.Item
                name="overuseNumber"
                label={I18n.t('licenses.overuse_number')}
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: '25%' }} />
              </Form.Item>
            )
          }


          <Form.Item
            name="startDate"
            label={I18n.t('licenses.start_date')}
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '25%' }} format={datePicketDateFormat} />
          </Form.Item>

          <Form.Item
            name="endDate"
            label={I18n.t('licenses.end_date')}
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '25%' }} format={datePicketDateFormat} />
          </Form.Item>

          <Form.Item
            name="enabled"
            label={I18n.t('licenses.enabled')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
