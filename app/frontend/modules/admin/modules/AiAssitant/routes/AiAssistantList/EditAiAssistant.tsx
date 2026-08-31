import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { Spin } from '@thetalententerprise/glint'
import { useResources } from '~/hooks/useResources/useResources'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import {
  AiAssistantTR, AiAssistant,
} from '../../core/aiAssistant'
import AiAssistantForm from './AiAssistantForm'

const { I18n } = window

const EditAiAssistant = () => {
  const { aiAssistantId } = useParams() as { aiAssistantId: string }
  const config = {
    basePath: '/ai',
    responseType: AiAssistantTR,
    apiConfig: {
      include: ['assistant_output_schema_keys'],
    },
  }
  const { getResource, fetchSingle, isLoading } = useResources<AiAssistant>('assistants', config)


  useEffect(() => {
    if (aiAssistantId) {
      fetchSingle({ id: aiAssistantId })
    }
  }, [aiAssistantId])

  const aiAssistant = getResource(aiAssistantId)


  return (
    isLoading('fetch') || !aiAssistant ? <Spin size="large" />
      : (
        <>
          <Breadcrumb
            crumbs={[
              {
                link: () => '/admin',
                label: () => I18n.t('admin.dashboard'),
              },
              {
                link: () => '/admin/ai_assistants',
                label: () => I18n.t('admin.ai_assistants'),
              },
              {
                label: () => aiAssistant?.name,
              },
              {
                label: () => I18n.t('admin.edit_ai_assistants'),
              },
            ]}
          />
          <AiAssistantForm aiAssistant={aiAssistant} />
        </>
      )
  )
}
export default EditAiAssistant
