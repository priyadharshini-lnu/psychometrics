import NormsEditor from './NormsEditor'
import { NormsEditorBreadcrumb } from './NormsEditorBreadcrumb'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { NormTR } from '~/modules/admin/modules/client/core/norms'

const { I18n } = window

const NormsEditorList = () => {
  const baseApiConfig = {
    trackUrl: true,
    responseType: NormTR,
    apiConfig: {
      include: ['dimension', 'updated_by', 'owner'],
      include_meta: ['permissions'],
      fields: { dimensions: ['name'], users: ['name'] },
      include_resource_meta: ['permissions'],
    },
  }
  return (
    <Resource
      title={I18n.t('admin.norms')}
      config={baseApiConfig}
      name="norms"
      settingsKey={TABLE_SETTINGS_KEYS.adminNormsEditor}
    >
      <NormsEditorBreadcrumb />
      <NormsEditor />
    </Resource>
  )
}

export default NormsEditorList
