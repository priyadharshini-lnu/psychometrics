import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import { AiAssistantTR } from '~/modules/admin/modules/AiAssitant/core/aiAssistant'
import { Resource } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { AiAssistantsTable } from './AiAssistantsTable'
import { AiAssistantsFilter } from './AiAssistantFilter'

const { I18n } = window

const connector = connect(
  () => ({
  }),
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

const AiAssistantList: React.FC<PropsFromRedux> = ({ openModal }) => {
  const config = {
    basePath: '/ai',
    responseType: AiAssistantTR,
    apiConfig: {
      include: ['assistant_output_schema_keys'],
    },
  }

  return (
    <Resource
      title={I18n.t('admin.ai_assistants')}
      config={config}
      name="assistants"
      settingsKey={TABLE_SETTINGS_KEYS.adminAiAssistants}
    >
      <AiAssistantsFilter openModal={openModal} />
      <AiAssistantsTable />
    </Resource>
  )
}

export default connector(AiAssistantList)
