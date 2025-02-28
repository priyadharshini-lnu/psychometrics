import { FC } from 'react'
import { App } from 'antd'
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
  const { message } = App.useApp()
  const handleOnConfirm = () => removeResource(id).then(() => {
    message.success(
      I18n.t('administration.campaigns.assessment_reports.report_approval.remove_modal_success', { reportId }),
    )
    close()
  }).catch((error) => {
    message.error(error)
  })

  return (
    <ConfirmationModal
      open
      title={I18n.t('administration.campaigns.assessment_reports.report_approval.modal_title')}
      message={I18n.t('administration.campaigns.assessment_reports.report_approval.remove_modal_text', { reportId })}
      onConfirm={handleOnConfirm}
      close={close}
    />
  )
}
