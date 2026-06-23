import React from 'react'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'

const { I18n } = window

export const AiAssistantsBreadcrumb: React.FC = () => (
  (
    <Breadcrumb
      crumbs={[
        {
          link: () => '/admin',
          label: () => I18n.t('users.dashboard'),
        },
        {
          label: () => I18n.t('admin.ai_assistants'),
        },
      ]}
    />
  )
)
