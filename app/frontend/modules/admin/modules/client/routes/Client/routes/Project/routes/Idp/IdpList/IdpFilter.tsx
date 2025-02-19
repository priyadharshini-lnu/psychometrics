import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Resource } from '~/modules/admin/components/Resource'

const { I18n } = window

export const IdpFilter: React.FC<{ openModal: () => void }> = ({
  openModal,
}) => (
  <>
    <Resource.Filter placeholder={I18n.t('common.actions.search')} name="filterable_fields">
      <Button
        type="primary"
        onClick={openModal}
      >
        <PlusOutlined />
        {I18n.t('administration.idp.add_idp_template')}
      </Button>
    </Resource.Filter>
  </>
)

export default IdpFilter
