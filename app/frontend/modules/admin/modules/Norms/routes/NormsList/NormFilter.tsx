import { Button } from 'antd'
import { PlusOutlined, ToolOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { Norm } from '~/modules/admin/modules/client/core/norms'

const { I18n } = window

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
  }

export const NormFilter: React.FC<Props> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<Norm>()

  const tableLoading = resource.isLoading('fetch')

  const handleMenuClick = ({ key }) => {
    if (key === 'import') {
      openModal('NormImportModal')
    }
  }

  return (
    <>
      <Resource.Filter placeholder={I18n.t('shared.search')} name="filterable_fields">
        <ConditionalDropdown
          menu={{
            items: [{
              key: 'import',
              label: (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {I18n.t('admin.norms_index_import')}
                </a>
              ),
            }],
            onClick: handleMenuClick,
          }}
          hideForEmptyMenu
          innerElement={(
            <Button>
              <ToolOutlined />
              <DownOutlined />
            </Button>
          )}
        />

        <Button
          type="primary"
          disabled={tableLoading}
          onClick={() => openModal('NormsFormModal')}
        >
          <PlusOutlined />
          {I18n.t('shared.create')}
        </Button>
      </Resource.Filter>
    </>
  )
}

export default NormFilter
