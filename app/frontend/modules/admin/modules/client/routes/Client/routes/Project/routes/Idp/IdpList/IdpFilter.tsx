import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { Idp } from '~/modules/admin/modules/client/core/idp'

const { I18n } = window

export const IdpFilter: React.FC<{ openModal: () => void }> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<Idp>()
  return (
    <Resource.Filter placeholder={I18n.t('common.actions.search')} name="filterable_fields">
      {resource.meta.permissions?.create && (
        <Button
          type="primary"
          onClick={openModal}
        >
          <PlusOutlined />
          {I18n.t('administration.idp.add_idp_template')}
        </Button>
      )}
    </Resource.Filter>
  )
}

export default IdpFilter
