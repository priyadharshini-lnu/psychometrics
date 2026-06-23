import { useEffect } from 'react'
import { Form } from 'antd'
import { useParams } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import ResourceFormModal from '~/components/ResourceFormModal'
import { LuaEditor } from '~/glint'

const { I18n } = window

interface CampaignScoringVariable {
  id: string
  variables?: string
}

interface Props {
  close(): void
  open: boolean
}

export const ManageVariablesForm: React.FC<Props> = ({
  close, open,
}) => {
  const { campaignId } = useParams() as { campaignId: string }
  const { data, fetch, updateResource: update } = useResources<CampaignScoringVariable>('campaign_scoring_variables', {
    basePath: `campaigns/${campaignId}`,
  })

  useEffect(() => {
    fetch()
  }, [])

  return (
    <ResourceFormModal
      resourceName="campaign_scoring_variables"
      readableResourceName={I18n.t('admin.scoring_campaign_scoring_variables')}
      resource={data[0]}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 700, open }}
      request={{ updateResource: values => update({ id: data[0].id, ...values }) }}
    >
      {() => (
        <>
          <Form.Item name="variables">
            <LuaEditor />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
