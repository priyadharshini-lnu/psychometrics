import { Table } from 'antd'
import { CheckOutlined, MoreOutlined } from '@ant-design/icons'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import userPresenter from '~/presenters/user'
import { getActionsMenuProps } from '../getActionsMenuProps'
import styles from './EvaluatorTable.less'

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

  return (
    <Table className="mtm" rowKey="id" dataSource={evaluators} pagination={false}>
      <Column
        title="Name"
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
        title="Email"
        key="user_email"
        render={({ user }) => user.email}
      />
      <Column title="Evaluations Received" dataIndex="evaluators" key="received_evaluations" />
      <Column title="Evaluations Completed" dataIndex="evaluations" key="completed_evaluations" />

      <Column
        title="Report Status"
        key="report_status"
        render={({ reportStatus }) => reportStatus && I18n.t(`reports.statuses.${reportStatus}`)}
      />

      <Column title="Status" key="status" render={({ status }) => status && I18n.t(`subjects.statuses.${status}`)} />

      <Column
        title="Is Subject"
        render={({ isSubject }) => isSubject && <CheckOutlined className="text-success" />}
        key="isSubject"
      />

      <Column
        key="action"
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
            innerElement={(
              <div className={styles.actions}>
                <MoreOutlined />
              </div>
            )}
          />
        )}
      />
    </Table>
  )
}
