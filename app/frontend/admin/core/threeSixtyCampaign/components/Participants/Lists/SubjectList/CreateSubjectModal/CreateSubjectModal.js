import React from 'react'
import { Modal, Button, Icon } from 'antd'

const CreateSubjectModal = ({ current, closeModal }) => {
  if (current !== 'CreateSubjectModal') return null

  const handleOk = () => console.log('handleOk')
  return (
    <Modal
      title="Add subjects"
      visible
      onCancel={closeModal}
      footer={[
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          <Icon type="check" />
          Add
        </Button>,
      ]}
    >
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </Modal>
  )
}

export default CreateSubjectModal
