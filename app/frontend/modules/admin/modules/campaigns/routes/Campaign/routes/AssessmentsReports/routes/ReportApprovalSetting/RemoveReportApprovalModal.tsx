import { FC } from 'react'
import { message } from 'antd'
import { RemoveResource } from '~/hooks/useResources/interfaces'
import { ConfirmationModal } from '~/glint'

const { I18n } = window

export interface Props {
  id: string
  reportId: string
  removeResource: RemoveResource
  close: () => void
}

export const RemoveReportApprovalSettingModal:FC<Props> = ({
  id, removeResource, reportId, close,
}) => {
  const handleOnConfirm = () => removeResource(id).then(() => {
    message.info(
      I18n.t('administration.campaigns.assessment_reports.report_approval.remove_modal_success', { reportId }),
    )
    close()
  }).catch((error) => {
    message.error(error)
  })

  return (
    <ConfirmationModal
      title={I18n.t('administration.campaigns.assessment_reports.report_approval.modal_title')}
      message={I18n.t('administration.campaigns.assessment_reports.report_approval.remove_modal_text', { reportId })}
      onConfirm={handleOnConfirm}
      onCancel={close}
    />
  )
}
