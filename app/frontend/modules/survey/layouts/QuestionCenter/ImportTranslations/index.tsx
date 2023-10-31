import { useState } from 'react'
import { Modal } from 'antd'

export const ImportModal = ({ show, onImport }) => {
  const [file, setFile] = useState<File>()

  return (
    <Modal open={show} onOk={() => onImport(file)} okText="Import">
      <div>Refer to the Export functionality to extract a template that can be used to Import here.</div>
      <input type="file" onChange={e => setFile(e.currentTarget.files?.[0])} />
    </Modal>
  )
}
