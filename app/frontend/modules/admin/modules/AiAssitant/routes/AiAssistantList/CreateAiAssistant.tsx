import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import AiAssistantForm from './AiAssistantForm'

const { I18n } = window

const CreateAiAssistant = () => (
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
          label: () => I18n.t('admin.create_ai_assistants'),
        },
      ]}
    />
    <AiAssistantForm />
  </>
)
export default CreateAiAssistant
