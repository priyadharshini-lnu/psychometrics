import { FC } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource } from '~/modules/admin/components/Resource'

const { I18n } = window

interface INormEditorFilterProps {
  saveNormEditor: () => void;
}

export const NormEditorFilter: FC<INormEditorFilterProps> = ({ saveNormEditor }) => (
  <>
    <Resource.Filter placeholder={I18n.t('common.actions.search')} name="filterable_fields">
      <Button
        type="primary"
        onClick={saveNormEditor}
      >
        <PlusOutlined />
        {I18n.t('common.actions.save')}
      </Button>
    </Resource.Filter>
  </>
)

export default NormEditorFilter
