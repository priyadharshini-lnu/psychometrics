import React from 'react'
import _ from 'lodash'
import {
  Modal, Button, Icon, Divider, Alert, Form, Form as AntForm,
} from 'antd'

export default function SubjectImportModal ({
  current,
  closeModal,
}) {
  if (current !== 'SubjectImportModal') return null

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
        <Button key="submit" type="primary" onClick={() => {}}>
          <Icon type="import" />
          Import
        </Button>,
      ]}
    >

    </Modal>
  )
}
