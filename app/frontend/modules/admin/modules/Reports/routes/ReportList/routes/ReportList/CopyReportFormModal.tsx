import React from 'react'
import {
  Form, Input, App,
} from 'antd'

import { useResourceContext } from '~/modules/admin/components/Resource'
import { Report, ReportTR } from '~/modules/admin/modules/client/core/reports'

import ResourceFormModal from '~/components/ResourceFormModal'

const { I18n } = window

interface Props {
  report: Report
  close(): void
}

type RequestFileds = {
  name: string
}

const CopyReportFormModal: React.FC<Props> = ({
  report, close,
}) => {
  const { message } = App.useApp()
  const { resource } = useResourceContext<Report>()


  const copy = (values: RequestFileds) => resource.memberAction({
    id: report.id,
    action: 'copy',
    method: 'post',
    updateStore: true,
    responseType: ReportTR,
    body: values,
  }).then((response: Report) => {
    resource.setMeta({ ...resource.meta, recordCount: resource.meta?.recordCount ? resource.meta?.recordCount + 1 : 0 })
    message.success(I18n.t('reports.actions.copy.success_message', { name: response.name }))
  })

  return (
    <ResourceFormModal
      resourceName="assessments"
      title={I18n.t('administration.reports.copy.copy_report')}
      readableResourceName={I18n.t('administration.reports.copy.copy_report')}
      close={close}
      scrollToFirstError
      request={{ createResource: copy }}
      modalProps={{ width: 550 }}
      formProps={{ initialValues: { name: `${report.name} - ${I18n.t('administration.reports.copy.copy')}` } }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('administration.reports.copy.name')}
            rules={[{ required: true }]}
          >
            <Input name="report_name" />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}

export default CopyReportFormModal
