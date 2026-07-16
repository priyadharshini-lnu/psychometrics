import React from 'react'
import { omit } from 'lodash'
import {
  Button, Modal, Row,
} from 'antd'
import {
  connect, ConnectedProps, useSelector, useDispatch,
} from 'react-redux'
import { SettingOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { openModal } from '~/modules/admin/core/ui/modals'
import { AssessmentTimerSettings } from '~/modules/survey/components/SettingsModal'
import { updateSettings } from './actions'
import Modals from '~/modules/admin/components/Modals/'

const { I18n } = window

type Extra = {
  timer?: number
}

const AgileSettingsModal = ({ close }) => {
  const extra = useSelector((state: {settings: { extra: Extra }}) => (state.settings.extra))
  const isAssessmentTimerAdded = extra && Object.prototype.hasOwnProperty.call(extra, 'timer')
  const dispatch = useDispatch()
  const updateTimer = (timer) => {
    dispatch(updateSettings({ ...extra, timer }))
  }
  const toggleTimer = () => {
    if (isAssessmentTimerAdded) {
      dispatch(updateSettings(omit(extra, 'timer')))
    } else {
      dispatch(updateSettings({ ...extra, timer: null }))
    }
  }

  return (
    <Modal
      open
      width="40%"
      title={I18n.t('administration.assessments.settings.title')}
      maskClosable
      onCancel={close}
      footer={[
        <Button key="close" onClick={close}>
          {I18n.t('administration.close')}
        </Button>,
      ]}
    >
      <Row gutter={[0, 16]}>
        <AssessmentTimerSettings
          isAssessmentTimerAdded={isAssessmentTimerAdded}
          time={extra?.timer}
          updateTimer={updateTimer}
          toggleTimer={toggleTimer}
          isAgile
        />
      </Row>
    </Modal>
  )
}

const MODALS = {
  AgileSettingsModal,
}

const connector = connect(
  null,
  {
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type AgileConfigHeaderComponentProps = PropsFromRedux & {
  extra: Extra
}

const AgileConfigHeaderComponent: React.FC<AgileConfigHeaderComponentProps> = ({ openModal, extra }) => (
  <>
    <Button
      icon={<SettingOutlined />}
      onClick={() => {
        openModal('AgileSettingsModal', { extra })
      }}
    >
      {I18n.t('administration.assessments.settings.title')}
    </Button>
    <Modals modals={MODALS} />
  </>
)

export const AgileConfigHeader = connector(AgileConfigHeaderComponent)

export default AgileConfigHeader
