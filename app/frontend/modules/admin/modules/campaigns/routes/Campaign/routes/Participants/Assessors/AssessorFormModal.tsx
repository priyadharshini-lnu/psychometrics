import React from 'react'
import ResourceFormModal from 'components/ResourceFormModal'

interface Props {
  projectId: string
  campaignId: string
  close(): void
  assessor?: {
    id: number
  }
}

const AssessorFormModal: React.FC<Props> = ({
  campaignId,
  close,
  assessor,
}) => (
  <ResourceFormModal
    resourceName="assessor"
    requestScope="campaigns"
    resourceBaseUrl={`/administration/new_campaigns/${campaignId}/assessors`}
    resource={assessor}
    showSuccessMessages
    close={close}
    modalProps={{ width: 550 }}
    formProps={{ initialValues: { } }}
  >
    {() => (
      <>
        Not Implemented yet
      </>
    )}
  </ResourceFormModal>
)

export default AssessorFormModal
