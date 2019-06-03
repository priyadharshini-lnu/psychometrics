import React, { useState } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Icon, Divider, Alert, Form, Form as AntForm,
} from 'antd'

export default function SubjectImportModal ({
  current,
  closeModal,
  importFile,
  match: {
    params: { campaignId },
  },
}) {
  // if (current !== 'SubjectImportModal') return null
  const [file, setFile] = useState(null)

  return (
    <Modal
      width={700}
      title="Import Subjects"
      visible
      onCancel={closeModal}
      footer={[
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary"
          onClick={() => {
            let data = new FormData();
            data.append('file', file);
            importFile(campaignId, data)}
          }>
          <Icon type="import" />
          Import
        </Button>,
      ]}
    >
      <div>
        <div>
          Each row must have a first name, last name and an email. Any other fields are optional.
          <br />
          If no username or password are provided then the email will be used for the username and the password will be randomly generated.
          <br />
          Duplicate entries will be updated with any changes or additional fields.
          The maximum file size is 100M.
        </div>
        <div className='mtl'>
          <input type='file' onChange={(e) => setFile(e.target.files[0])} />
        </div>
      </div>
    </Modal>
  )
}
