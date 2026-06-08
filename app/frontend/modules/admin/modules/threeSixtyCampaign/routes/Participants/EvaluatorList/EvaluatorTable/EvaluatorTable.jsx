import { Table } from 'antd'
import { CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import userPresenter from '~/presenters/user'
import { getActionsMenuProps } from '../getActionsMenuProps'
import { useWindowSize } from '~/hooks/useWindowSize'

const { Column } = Table

export default function EvaluatorTable ({
  evaluators,
  openModal,
  onCloseParticipantModal,
  campaignId,
  removeUser,
  editUser,
}) {
  const openParticipantModal = (user, permissions) => {
    openModal('ParticipantModal', { user, permissions, onClose: onCloseParticipantModal })
  }
  const { width: windowWidth } = useWindowSize()
  return (
    <Table className="mtm" rowKey="id" dataSource={evaluators} pagination={false} scroll={{ x: 'max-content' }}>
      <Column
        title={I18n.t('shared.name')}
        fixed={windowWidth > 800 ? 'left' : undefined}
        key="fullName"
        render={({ user, permissions }) => (
          <a
            role="button"
            tabIndex="0"
            onClick={() => openParticipantModal(user, permissions)}
          >
            {userPresenter.getFullName(user)}
          </a>
        )}
      />
      <Column
        title={I18n.t('shared.email')}
        key="user_email"
        render={({ user }) => user.email}
      />
      <Column
        title={I18n.t('admin.evaluations_received')}
        dataIndex="evaluators"
        key="received_evaluations"
      />
      <Column
        title={I18n.t('admin.evaluations_completed')}
        dataIndex="evaluations"
        key="completed_evaluations"
      />

      <Column
        title={I18n.t('admin.report_status')}
        key="report_status"
        render={({ reportStatus }) => reportStatus && I18n.t(`reports.statuses.${reportStatus}`)}
      />

      <Column
        title={I18n.t('admin.evaluation_status')}
        key="status"
        render={({ status }) => status && I18n.t(`admin.${status}`)}
      />

      <Column
        title={I18n.t('admin.is_subject')}
        render={({ isSubject }) => isSubject && <CheckOutlined className="text-success" />}
        key="isSubject"
      />

      <Column
        key="action"
        fixed={windowWidth > 800 ? 'right' : undefined}
        render={({ user, permissions }) => (
          <ConditionalDropdown
            menu={
              getActionsMenuProps({
                user,
                permissions,
                campaignId,
                removeUser,
                editUser,
                openModal,
                onUserUpdate: onCloseParticipantModal,
              })
            }
          />
        )}
      />
    </Table>
  )
}
