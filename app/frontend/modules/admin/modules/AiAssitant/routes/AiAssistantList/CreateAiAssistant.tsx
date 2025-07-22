import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import AiAssistantForm from './AiAssistantForm'

const { I18n } = window

const CreateAiAssistant = () => (
  <>
    <Breadcrumb
      crumbs={[
        {
          link: () => '/admin',
          label: () => I18n.t('users.dashboard'),
        },
        {
          link: () => '/admin/ai_assistants',
          label: () => I18n.t('administration.ai_assistants.ai_assistants'),
        },
        {
          label: () => I18n.t('administration.ai_assistants.actions.create'),
        },
      ]}
    />
    <AiAssistantForm />
  </>
)
export default CreateAiAssistant
