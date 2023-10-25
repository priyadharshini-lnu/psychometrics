import _ from 'lodash'
import { useContext, useState } from 'react'
import {
  Table, Dropdown, Button, Row, Popconfirm, Card, Typography, Space, MenuProps,
} from 'antd'
import {
  DownOutlined, CheckOutlined, ReloadOutlined, DeleteOutlined, PlusOutlined,
} from '@ant-design/icons'

import userPresenter from '~/presenters/user'
import statusPresenter from '~/presenters/status'
import conditionPresenter from '~/presenters/condition'
import { EVALUATOR_NOMINATION_STATUSES } from '~/constants/participantStatuses'
import { statusMenuItems } from '~/modules/endUser/modules/campaigns/common/menuItems'
import { MediaQueryContext } from '~/glint'
import styles from './RequirementTable.less'
import { InlineInput } from '../InlineInput'

const { Column } = Table
const { I18n } = window
const { Title, Text } = Typography

export const RequirementTable = (props) => {
  const {
    removeNomination, updateStatus, allowedRelationshipsForNewNominations,
    match, handleAddNomination,
    nomination: { isSelf, options },
    canNominate,
    requirement: { condition, title, evaluators },
    match: { params: { campaignId, id: nominationId } },
    currentUser,
  } = props
  const { isMobile } = useContext(MediaQueryContext)
  const [showForm, setShowForm] = useState(false)

  const getStatusMenuProps = ({ id }): MenuProps => ({
    items: statusMenuItems,
    onClick: (e) => {
      updateStatus({
        campaignId, nominationId, evaluatorId: id, status: e.key,
      })
    },
  })

  const renderRequirementCell = (value) => {
    if (value.evaluator) {
      return {
        children: (
          <>
            <Text>{userPresenter.getFullName(value.evaluator)}</Text>
            <br />
            <Text type="secondary">{value.evaluator.email}</Text>
          </>),
      }
    }

    return {
      children: <InlineInput
        title={title}
        match={match}
        relationship={condition.relationshipId}
        handleAddNomination={handleAddNomination}
        {...props}
        hideForm={() => { setShowForm(false) }}
      />,
      props: { colSpan: 4 },
    }
  }

  const renderApprovalStatus = (evaluator) => {
    if (evaluator.id === 'form') { return { props: { colSpan: 0 } } }
    if (!evaluator) { return { props: { colSpan: 0 } } }
    if (evaluator.evaluatorNominationStatus === EVALUATOR_NOMINATION_STATUSES.DECLINED) {
      return { children: 'Declined' }
    }

    if (isSelf || currentUser.id === evaluator.evaluator.id) {
      return { children: evaluator && statusPresenter.getApprovalStatus(evaluator.approvalStatus) }
    }

    if (!options.participants.manager.canApproveNominations) {
      return { children: '' }
    }

    if (evaluator.approvalStatus !== 'waiting') {
      return (
        <Dropdown
          trigger={['click']}
          menu={getStatusMenuProps(evaluator)}
        >
          <div>
            <Space>
              { statusPresenter.getApprovalStatus(evaluator.approvalStatus) }
              <DownOutlined />
            </Space>
          </div>
        </Dropdown>
      )
    }

    return (
      <Space>
        <Button
          size="small"
          type="primary"
          onClick={() => updateStatus({
            campaignId, nominationId, evaluatorId: evaluator.id, status: 'approved',
          })}
        >
          {I18n.t('threesixty.approve')}
        </Button>
        <Button
          size="small"
          danger
          onClick={() => updateStatus({
            campaignId, nominationId, evaluatorId: evaluator.id, status: 'denied',
          })}
        >
          {I18n.t('threesixty.deny')}
        </Button>
      </Space>
    )
  }

  const renderStatus = ({ evaluator, evaluatorNominationStatus }) => {
    if (!evaluator) { return { props: { colSpan: 0 } } }
    return {
      children: (
        <>
          {evaluatorNominationStatus === 'completed'
            ? <CheckOutlined />
            : <ReloadOutlined className={styles.waitingIcon} /> }
          {' '}
          {statusPresenter.getStatus(evaluatorNominationStatus)}
        </>),
    }
  }

  // eslint-disable-next-line no-mixed-operators
  const rowData = evaluators && [...evaluators] || []
  if (showForm) {
    rowData.push({ id: 'form' })
  }

  let canAdd = canNominate
  if (options.participants.subject.limitRelationshipThatSubjectCanSelect) {
    canAdd = canAdd && _.get(options, ['participants', 'subject', 'canSelectRelationships', condition.relationshipId])
  }

  const relationshipAllowed = _.find(allowedRelationshipsForNewNominations,
    relationship => relationship.id === condition.relationshipId)

  if (!relationshipAllowed) { canAdd = false }

  return (
    <Card
      title={isMobile ? '' : (
        <span>
          <Title level={5} className={styles.cardTitle}>{title}</Title>
          {' '}
          {!condition.withoutConditions && `(${conditionPresenter.getCondition(condition)})`}
        </span>
      )}
      className={styles.card}
    >
      <Table
        rowKey="id"
        dataSource={rowData}
        pagination={false}
        className={styles.dataTable}
      >
        <Column
          width="50%"
          title={isMobile ? '' : (
            <Text type="secondary" className={styles.columnTitle}>{I18n.t('threesixty.name_label')}</Text>
          )}
          key="title"
          render={renderRequirementCell}
        />
        <Column
          width="20%"
          title={isMobile ? ''
            : <Text type="secondary" className={styles.columnTitle}>{I18n.t('threesixty.evaluation')}</Text>}
          render={renderStatus}
          key="evaluatorNominationStatus"
        />
        <Column
          title={isMobile ? ''
            : <Text type="secondary" className={styles.columnTitle}>{I18n.t('threesixty.nomination')}</Text>}
          render={renderApprovalStatus}
          key="status"
        />
        <Column
          title={isMobile ? '' : (
            <Text type="secondary" className={styles.columnTitle}>
              {I18n.t('threesixty.action')}
            </Text>
          )}
          width="76px"
          render={(value) => {
            if (!value.canRemove || !value.evaluator || !canNominate) { return null }
            return (
              <div className="ta-e">
                <Popconfirm
                  title={I18n.t('threesixty.confirmation_for_nomination_removal')}
                  onConfirm={() => removeNomination({ campaignId, nominationId, evaluator: value })}
                >
                  <DeleteOutlined />
                </Popconfirm>
              </div>
            )
          }}
        />
      </Table>
      {canAdd && (
        <Row justify="end" style={{ marginTop: 8 }}>
          <Button type="link" onClick={() => setShowForm(true)} disabled={showForm}>
            <PlusOutlined />
            {' '}
            {title}
          </Button>
        </Row>
      )}
    </Card>
  )
}
