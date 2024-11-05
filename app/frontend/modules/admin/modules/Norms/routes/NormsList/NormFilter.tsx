
import { Button } from 'antd'
import { PlusOutlined, ToolOutlined, DownOutlined } from '@ant-design/icons'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { Norm } from '~/modules/admin/modules/client/core/norms'

const { I18n } = window

export const NormFilter: React.FC<{ openModal: () => void }> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<Norm>()

  const tableLoading = resource.isLoading('fetch')

  return (
    <>
      <Resource.Filter placeholder={I18n.t('common.actions.search')} name="filterable_fields">
        <ConditionalDropdown
          menu={{
            items: [{
              key: 'import',
              label: (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {I18n.t('sheet.menu.import')}
                </a>
              ),
            }],
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
          onClick={openModal}
        >
          <PlusOutlined />
          {I18n.t('common.actions.create')}
        </Button>
      </Resource.Filter>
    </>
  )
}

export default NormFilter
