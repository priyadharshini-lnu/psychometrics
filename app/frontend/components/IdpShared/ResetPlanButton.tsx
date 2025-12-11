import React from 'react'
import {
  Button, Popconfirm,
} from 'antd'

const { I18n } = window

type ResetPlanButtonProps = {
  action: () => void
}

export const ResetPlanButton: React.FC<ResetPlanButtonProps> = ({ action }) => (
  <Popconfirm
    title={I18n.t('admin.reset_idp_plan_title')}
    description={I18n.t('admin.reset_idp_plan_confirmation')}
    okText={I18n.t('common.actions.yes')}
    cancelText={I18n.t('common.actions.no')}
    onConfirm={action}
  >
    <Button
      danger
    >
      {I18n.t('admin.reset_idp_plan_title')}
    </Button>
  </Popconfirm>
)
