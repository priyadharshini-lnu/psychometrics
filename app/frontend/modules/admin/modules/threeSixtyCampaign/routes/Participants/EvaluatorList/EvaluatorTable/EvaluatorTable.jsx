import { Button, Table } from 'antd'
import { useBreakpoint } from '@thetalententerprise/glint'
import { CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import userPresenter from '~/presenters/user'
import { getActionsMenuProps } from '../getActionsMenuProps'

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
  const screens = useBreakpoint()
  return (
    <Table rowKey="id" dataSource={evaluators} pagination={false} scroll={{ x: 'max-content' }}>
      <Column
        title={I18n.t('shared.name')}
        fixed={screens.md ? 'left' : undefined}
        key="fullName"
        minWidth={200}
        render={({ user, permissions }) => (
          <Button
            type="link"
            size="small"
            className="p-0"
            onClick={() => openParticipantModal(user, permissions)}
          >
            {userPresenter.getFullName(user)}
          </Button>
        )}
      />
      <Column
        title={I18n.t('shared.email')}
        key="user_email"
        minWidth={200}
        render={({ user }) => user.email}
      />
      <Column
        title={I18n.t('admin.evaluations_received')}
        dataIndex="evaluators"
        key="received_evaluations"
        minWidth={100}
      />
      <Column
        title={I18n.t('admin.evaluations_completed')}
        dataIndex="evaluations"
        key="completed_evaluations"
        minWidth={100}
      />

      <Column
        title={I18n.t('admin.report_status')}
        key="report_status"
        minWidth={150}
        render={({ reportStatus }) => reportStatus && I18n.t(`reports.statuses.${reportStatus}`)}
      />

      <Column
        title={I18n.t('admin.evaluation_status')}
        key="status"
        minWidth={150}
        render={({ status }) => status && I18n.t(`admin.${status}`)}
      />

      <Column
        title={I18n.t('admin.is_subject')}
        render={({ isSubject }) => isSubject && <CheckOutlined className="text-success" />}
        key="isSubject"
        minWidth={100}
      />

      <Column
        key="action"
        minWidth={100}
        fixed={screens.md ? 'right' : undefined}
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
