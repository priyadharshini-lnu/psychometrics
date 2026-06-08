import {
  Dropdown, Button, Space,
} from 'antd'
import {
  DownOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

const saveFilterButtonStyles: React.CSSProperties = {
  marginLeft: 'auto', position: 'absolute', right: '10px', top: '-30px',
}

const { I18n } = window


export const SavedFiltersDropdown = ({ savedFilters }) => (
  <Dropdown styles={{ root: { width: '500px' } }} menu={{ items: savedFilters }}>
    <Button style={saveFilterButtonStyles}>
      <Space>
        {I18n.t('admin.report_approval_saving_filters_actions_saved_filters')}
        <DownOutlined />
      </Space>
    </Button>
  </Dropdown>
)
