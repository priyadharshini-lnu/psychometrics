import React from 'react'
import {
  Modal, Button, Icon, Input, Divider,
} from 'antd'
import Table from './Table'

const CreateSubjectModal = ({ current, closeModal }) => {
  if (current !== 'CreateSubjectModal') return null

  const handleOk = () => console.log('handleOk')
  return (
    <Modal
      width={700}
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
      <Input.Search placeholder="input search text" onSearch={value => console.log(value)} style={{ width: 200 }} />
      <Divider />
      <Table />
    </Modal>
  )
}

export default CreateSubjectModal
