import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import VoiceCharacterForm from './VoiceCharacterForm'

const { I18n } = window

const CreateVoiceCharacter = () => (
  <>
    <Breadcrumb
      crumbs={[
        {
          link: () => '/admin',
          label: () => I18n.t('admin.dashboard'),
        },
        {
          link: () => '/admin/ai_voice_characters',
          label: () => I18n.t('admin.voice_characters'),
        },
        {
          label: () => I18n.t('admin.create_voice_character'),
        },
      ]}
    />
    <VoiceCharacterForm />
  </>
)

export default CreateVoiceCharacter
