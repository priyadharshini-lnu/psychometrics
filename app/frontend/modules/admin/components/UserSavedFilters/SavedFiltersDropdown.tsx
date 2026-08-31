import {
  Dropdown, Button, Space,
} from 'antd'
import {
  DownOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window


export const SavedFiltersDropdown = ({ savedFilters }) => (
  <Dropdown styles={{ root: { width: '500px' } }} menu={{ items: savedFilters }}>
    <Button>
      <Space>
        {I18n.t('admin.report_approval_saving_filters_actions_saved_filters')}
        <DownOutlined />
      </Space>
    </Button>
  </Dropdown>
)
