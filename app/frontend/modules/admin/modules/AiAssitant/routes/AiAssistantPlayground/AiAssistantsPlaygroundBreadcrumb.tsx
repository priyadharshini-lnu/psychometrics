import React from 'react'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'

const { I18n } = window

export const AiAssistantsPlaygroundBreadcrumb: React.FC = () => (
  (
    <Breadcrumb
      crumbs={[
        {
          link: () => '/admin',
          label: () => I18n.t('admin.dashboard'),
        },
        {
          label: () => I18n.t('admin.ai_assistants'),
          link: () => '/admin/ai_assistants',
        },
        {
          label: () => I18n.t('admin.ai_assistants_playground'),
        },
      ]}
    />
  )
)
