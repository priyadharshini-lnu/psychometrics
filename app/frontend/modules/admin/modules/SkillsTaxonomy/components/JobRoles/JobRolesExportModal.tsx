import React, { useEffect, useRef, useState } from 'react'
import {
  Button, Modal,
  Switch,
} from 'antd'
import { OwnerAndProjectDropdown, useClientsAndProjectsResource } from '~/components/OwnerAndProjectDropdown'
import styles from './styles.less'

const { I18n } = window

interface OwnProps {
  close(): void,
  handleExport: (projectId?: number) => void
  title: string
}

export const JobRolesExportModal: React.FC<OwnProps> = ({
  close,
  handleExport,
  title,
}) => {
  const formRef = useRef<{ resetForm:() => void,
    setForm: (values: {projectId:string, ownerId: string}) => void }>(null)
  const [isGlobal, setIsGlobal] = useState(false)
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
    if (projectId || isGlobal) {
      handleExport(projectId ? parseInt(projectId, 10) : undefined)
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
          disabled={!(projectId || isGlobal)}
        >
          {I18n.t('administration.skills.export.title')}
        </Button>,
      ]}
    >
      <label className={styles.label}>
        {I18n.t('common.text.global_export')}
        <Switch value={isGlobal} onChange={setIsGlobal} />
      </label>
      {
        !isGlobal ? (
          <OwnerAndProjectDropdown
            ref={formRef}
            projectOpts={projects}
            ownerOpts={owners}
            onProjectsSearch={handleProjectsSearch}
            onOwnersSearch={handleOwnersSearch}
            onValuesChange={handleValuesChange}
          />
        ) : null
      }
    </Modal>
  )
}
