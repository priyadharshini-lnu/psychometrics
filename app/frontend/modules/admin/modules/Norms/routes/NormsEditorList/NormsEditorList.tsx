import NormsEditor from './NormsEditor'
import { NormsEditorBreadcrumb } from './NormsEditorBreadcrumb'
import { Resource } from '~/modules/admin/components/Resource'
import { NormTR } from '~/modules/admin/modules/client/core/norms'

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
    <Resource config={baseApiConfig} name="norms">
      <NormsEditorBreadcrumb />
      <NormsEditor />
    </Resource>
  )
}

export default NormsEditorList
