import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import { Report, ReportTR } from '~/modules/admin/modules/client/core/reports'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { EditForm } from './EditForm'

const { I18n } = window
const EditReport: React.FC = () => {
  const { id } = useParams<{id: string}>()
  useEffect(() => {
    fetchSingle({ id })
  }, [id])

  const { fetchSingle, getResource } = useResources<Report>('reports', {
    responseType: ReportTR,
    apiConfig: {
      include: ['assessments', 'owner'],
      include_resource_meta: ['permissions'],
      fields: { assessments: ['name', 'type'] },
    },
  })

  const report = getResource(id)
  if (!report) return null

  return (
    <>
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin',
            label: () => I18n.t('reports.dashboard'),
          },
          {
            label: () => I18n.t('reports.reports'),
            link: () => '/admin/reports',
          },
          {
            label: () => report.name,
          },
          {
            label: () => I18n.t('reports.actions.edit'),
          },
        ]}
      />
      <EditForm report={report} />
    </>
  )
}

export default EditReport
