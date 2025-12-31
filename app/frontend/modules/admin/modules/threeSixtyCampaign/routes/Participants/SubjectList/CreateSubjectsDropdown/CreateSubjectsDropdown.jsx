import { Button, Dropdown } from 'antd'
import { PlusOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

const CreateSubjectsDropdown = ({ openModal }) => {
  const menuItems = [
    { key: 'add', label: I18n.t('administration.threesixty_campaigns.menu.participants.subjects.add_subjects') },
    { key: 'import', label: I18n.t('administration.threesixty_campaigns.menu.participants.subjects.import_subjects') },
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
        <span>{I18n.t('administration.threesixty_campaigns.menu.participants.subjects.add_subjects')}</span>
        <DownOutlined />
      </Button>
    </Dropdown>
  )
}

export default CreateSubjectsDropdown
