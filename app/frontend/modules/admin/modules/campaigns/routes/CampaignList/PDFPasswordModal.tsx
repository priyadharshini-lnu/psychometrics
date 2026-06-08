import React, { useEffect, useState } from 'react'
import {
  Modal, Spin, Typography, message,
} from 'antd'
import { ConnectedProps, connect } from 'react-redux'
import { PDF_PASSWORD, fetchPdfPassword } from '~/modules/admin/modules/campaigns/core/list'
import { isRequestInProgress } from '~/core/request'
import { RootState } from '~/modules/admin/core/rootReducers'

export interface OwnProps {
  close(): void
  projectId: number
  campaignId: number
}

const connector = connect(
  (state: RootState) => ({
    isPasswordLoading: isRequestInProgress(state, PDF_PASSWORD),
  }),
  {
    fetchPdfPassword,
  },
)
type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & OwnProps

const { I18n } = window

const PDFPasswordModalComponent: React.FC<Props> = ({
  projectId, campaignId, fetchPdfPassword, isPasswordLoading, close,
}) => {
  const [pdfPassword, setPdfPassword] = useState<string | null>(null)

  useEffect(() => {
    fetchPdfPassword(projectId, campaignId).then(({ response: { pdfPassword } }) => {
      setPdfPassword(pdfPassword)
    }).catch(() => {
      message.error(I18n.t('admin.errors_error_msg'))
      close()
    })
  }, [])

  return (
    <Modal title={I18n.t('admin.campaigns_pdf_password')} open onCancel={close}>
      <Spin spinning={isPasswordLoading} />
      {pdfPassword && (
        <Typography.Text copyable>
          {pdfPassword}
        </Typography.Text>
      )}
    </Modal>
  )
}

export const PDFPasswordModal = connector(PDFPasswordModalComponent)
