import { Button, Result } from 'antd'
import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { DashboardOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { openModal } from '~/modules/admin/core/ui/modals'
import Modals from '~/modules/admin/components/Modals'
import { DashboardFormModal } from '../DashboardFormModal'

const { I18n } = window
const MODALS = {
  DashboardFormModal,
}


const connecter = connect(
  null,
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

export const InitializeComponent: React.FC<Props> = ({ openModal }) => (
  <div className="pt-4 pb-4 ps-4 pe-4">
    <Result
      icon={<DashboardOutlined />}
      title={I18n.t('admin.dashboard_initialize_msg')}
      extra={(
        <Button
          type="primary"
          onClick={() => {
            openModal('DashboardFormModal')
          }}
        >
          {I18n.t('admin.dashboard_get_started')}
        </Button>
      )}
    />
    <Modals modals={MODALS} />
  </div>
)

export const Initialize = connecter(InitializeComponent)
