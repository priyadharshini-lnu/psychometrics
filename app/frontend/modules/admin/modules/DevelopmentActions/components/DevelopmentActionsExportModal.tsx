import React, {
  useEffect, useRef, useState,
} from 'react'
import {
  Button, Modal,
} from 'antd'
import { OwnerAndProjectDropdown, useClientsAndProjectsResource } from '~/components/OwnerAndProjectDropdown'

const { I18n } = window

interface OwnProps {
  close(): void,
  handleExport: (projectId:number) => void
  title: string
}

export const DevelopmentActionsExportModal: React.FC<OwnProps> = ({
  close,
  handleExport,
  title,
}) => {
  const formRef = useRef<{ resetForm:() => void,
    setForm: (values: {projectId:string, ownerId: string}) => void }>(null)
  const [projectId, setProjectId] = useState<string | null>()
  const [ownerId, setOwnerId] = useState<string | null>()
  const {
    owners,
    projects,
    handleProjectsSearch,
    handleOwnersSearch,
  } = useClientsAndProjectsResource(ownerId || '')

  const handleValuesChange = (changedValues: Record<string, string>) => {
    if (changedValues?.ownerId) {
      setOwnerId(changedValues?.ownerId)
      setProjectId(null)
    }

    if (changedValues?.projectId) {
      setProjectId(changedValues?.projectId)
    }
  }

  useEffect(() => {
    if (ownerId) {
      handleProjectsSearch()
    }
  }, [ownerId])

  useEffect(() => {
    handleOwnersSearch()
  }, [])

  const handleSubmit = () => {
    if (projectId) {
      handleExport(parseInt(projectId, 10))
      close()
    }
  }

  return (
    <Modal
      width={700}
      title={title}
      open
      onCancel={close}
      footer={[
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={!projectId}
        >
          {I18n.t('administration.development_actions.export.title')}
        </Button>,
      ]}
    >
      <OwnerAndProjectDropdown
        ref={formRef}
        projectOpts={projects}
        ownerOpts={owners}
        onProjectsSearch={handleProjectsSearch}
        onOwnersSearch={handleOwnersSearch}
        onValuesChange={handleValuesChange}
      />
    </Modal>
  )
}
