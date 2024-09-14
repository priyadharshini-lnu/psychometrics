import { Button, Dropdown } from 'antd'
import { PlusOutlined, DownOutlined } from '@ant-design/icons'

const CreateSubjectsDropdown = ({ openModal }) => {
  const menuItems = [
    { key: 'add', label: 'Add Subjects...' },
    { key: 'import', label: 'Import Subjects...' },
  ]
  const handleMenuClick = ({ key }) => {
    if (key === 'add') {
      openModal('CreateSubjectModal')
    }
    if (key === 'import') {
      openModal('SubjectImportModal')
    }
  }

  return (
    <Dropdown
      menu={{ items: menuItems, onClick: handleMenuClick }}
      className="mrm"
      trigger={['click']}
    >
      <Button type="primary">
        <PlusOutlined />
        <span>Add Subjects</span>
        <DownOutlined />
      </Button>
    </Dropdown>
  )
}

export default CreateSubjectsDropdown
