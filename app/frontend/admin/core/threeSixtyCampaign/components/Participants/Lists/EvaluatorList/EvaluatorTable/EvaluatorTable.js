import React from 'react'
import { Dropdown, Icon, Table } from 'antd'
import userPresenter from 'presenters/userPresenter'
import ActionsMenu from '../ActionsMenu'
import styles from './EvaluatorTable.scss'

const { Column } = Table

export default function EvaluatorTable ({
  evaluators,
  openModal,
  onCloseParticipantModal,
  campaignId,
  removeUser,
}) {
  const openParticipantModal = (user) => {
    openModal('ParticipantModal', { user, onClose: onCloseParticipantModal })
  }

  return (
    <Table className="mtm" rowKey="id" dataSource={evaluators} pagination={false}>
      <Column
        title="Name"
        key="fullName"
        render={({ user }) => (
          <a
            role="button"
            tabIndex="0"
            onClick={() => openParticipantModal(user)}
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
        render={({ isSubject }) => isSubject && <Icon className="text-success" type="check" />
        }
        key="isSubject"
      />

      <Column
        key="action"
        render={({ user }) => (
          <Dropdown
            overlay={() => ActionsMenu({
              user,
              campaignId,
              removeUser,
            })
            }
            trigger={['click']}
          >
            <div className={styles.actions}>
              <Icon type="ellipsis" />
            </div>
          </Dropdown>
        )}
      />
    </Table>
  )
}
