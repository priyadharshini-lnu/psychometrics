import _ from 'lodash'
import { useState } from 'react'
import {
  Dropdown, Progress, Modal, Tooltip, Typography, Row, Button,
} from 'antd'
import { connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  InfoCircleOutlined, QuestionCircleOutlined, EllipsisOutlined, DownOutlined, CheckCircleFilled,
} from '~/glint/icons/AccessibleIconsAntDesign'

import userPresenter from '~/presenters/user'
import WizardIsRequired from '~/modules/endUser/core/WizardIsRequired'
import { STATUSES } from '~/constants/userResult'
import { getUserEvaluations, getManagedSubjects } from '~/modules/endUser/modules/campaigns/core/campaign/selectors'
import { declineEvaluation } from '~/modules/endUser/modules/campaigns/core/campaign'
import { SafeHTML } from '~/components/SafeHTML'
import { CollapseItem } from '~/glint'
import { EditEvaluationModal } from '../EditEvaluationModal'
import { ThreesixtyCard } from '../ThreesixtyCard'
import styles from '../ListStyles.less'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connector = connect((state: any) => ({
  evaluations: getUserEvaluations(state),
  evaluationsCounters: state.campaigns.campaign.evaluationsCounters,
  managedSubjects: getManagedSubjects(state.campaigns),
  options: state.campaigns.campaign.options.participants,
  instructions: state.campaigns.campaign.instructions,
}),
{
  declineEvaluation,
})

const { I18n } = window
const { Title } = Typography

const EvaluationListComponent = ({
  evaluations, managedSubjects, declineEvaluation, options, percent, evaluationsCounters,
  instructions,
}) => {
  const navigate = useNavigate()
  const [showHelp, setShowHelp] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const isEvaluationCompleted = item => item.status === STATUSES.COMPLETED
  const evaluationHelp = _.find(instructions, { name: 'evaluation_help' })
  const canNotEvaluate = (item) => {
    if (item.subjectEvaluationClosed) { return true }
    if (options.global.disableAllEvaluations) { return true }

    return options.global.canNotEditEvaluation && isEvaluationCompleted(item)
  }

  const getMenuProps = item => (
    {
      items: !isEvaluationCompleted(item)
        ? [{ key: 'decline_invite', label: I18n.t('threesixty.decline_invite') }] : [],
      onClick: () => declineEvaluation(item.campaignId, item.id),
    }
  )

  const evaluatorsList = subject => ({
    items: subject.evaluators.map(evaluator => ({
      key: evaluator.id,
      label: userPresenter.getFullNameWithEmail(evaluator.user),
    })),
    onClick: ({ key }) => {
      // eslint-disable-next-line max-len
      navigate(`/threesixty_campaigns/${subject.campaignId}/evaluations/${key}?approve_evaluation=true&read=true`)
    },
  })

  const showDeclineEvaluationDropdown = item => (
    options.evaluator.canDeclineNomination && !item.subjectEvaluationClosed && !item.isSelf
      && !isEvaluationCompleted(item)
  )

  const getPath = (item) => {
    const assessmentLanguage = item.availableLanguages?.includes(I18n.locale) ? I18n.locale : item.defaultLanguage

    if (!isEvaluationCompleted(item) && WizardIsRequired.run(item.assessmentExtra, item.id)) {
      return `/system_checks/${item.assessmentId}/${item.id}`
    }
    // eslint-disable-next-line max-len
    return `/threesixty_campaigns/${item.campaignId}/evaluations/${item.id}?edit=${isEvaluationCompleted(item)}&lang=${assessmentLanguage}`
  }

  const handleAssessmentLinkClick = (e, item, href) => {
    if (isEvaluationCompleted(item)) {
      setEditModal(item)
      e.preventDefault()
      return
    }
    location.href = href
  }

  const EvaluationItem = ({ item }) => {
    const { subjectEvaluationClosed } = item || { subjectEvaluationClosed: false }
    const { subject } = item || { subject: { firstName: '', lastName: '' } }
    const email = subject.email || ''

    return (
      <>
        <Tooltip placement="topLeft" title={email}>
          <Button
            className="pt-0 pb-0"
            onClick={e => handleAssessmentLinkClick(e, item, getPath(item))}
            type="link"
            disabled={canNotEvaluate(item)}
          >
            <span className={styles.subjectLabel}>{userPresenter.selfUserName(item, subject)}</span>
            {isEvaluationCompleted(item) ? <CheckCircleFilled className={styles.completed} /> : null}
          </Button>
        </Tooltip>

        {options.global.disableAllEvaluations && (
          <Tooltip placement="top" title={I18n.t('threesixty.evaluation_all_closed_message')}>
            <span><InfoCircleOutlined /></span>
          </Tooltip>
        )}

        {!options.global.disableAllEvaluations && subjectEvaluationClosed && (
          <Tooltip placement="top" title={I18n.t('threesixty.evaluation_closed_message')}>
            <span><InfoCircleOutlined /></span>
          </Tooltip>
        )}

        {showDeclineEvaluationDropdown(item)
          && (
            <Dropdown menu={getMenuProps(item)} trigger={['click']} placement="bottomRight">
              <a href="#" style={{ flex: 'none' }}>
                <EllipsisOutlined />
              </a>
            </Dropdown>
          )
        }
        <br />
      </>
    )
  }

  const SubjectItem = ({ item }) => {
    const { user } = item || { user: undefined }
    return (
      <>
        <Dropdown menu={evaluatorsList(item)} trigger={['click']} placement="bottomRight">
          <a href="#">
            <Tooltip placement="topLeft" title={user?.email ?? ''}>
              <div className={styles.flex}>
                {userPresenter.selfUserName(item)}
                {' '}
                <DownOutlined />
              </div>
            </Tooltip>
          </a>
        </Dropdown>
      </>
    )
  }

  const ManagedList = ({ title, list }) => (
    <CollapseItem
      title={title}
      list={list}
    >
      {item => <SubjectItem key={item.id} item={item} />}
    </CollapseItem>
  )

  return (
    <ThreesixtyCard
      title={<Title className="fs-16" level={2}>{I18n.t('threesixty.evaluations')}</Title>}
      helpIcon={evaluationHelp && (
        <div>
          <Button
            aria-label={I18n.t('threesixty.more_info_evaluation_label')}
            type="link"
            size="small"
            onClick={() => setShowHelp(true)}
            icon={<QuestionCircleOutlined />}
          />
        </div>
      )}
    >
      <Row wrap={false}>
        <Progress
          className={styles.progressBar}
          percent={percent}
          showInfo={false}
        />
        <span className={styles.count}>
          {I18n.t('threesixty.progress_text', {
            completed: evaluationsCounters.completedEvaluations,
            total: evaluationsCounters.totalEvaluations,
          })}
        </span>
      </Row>
      {!evaluations.length || (
        <CollapseItem
          title={I18n.t('threesixty.evaluations')}
          list={evaluations}
        >
          {item => <EvaluationItem key={item.id} item={item} />}
        </CollapseItem>
      )}
      {options.manager.canApprovesEvaluations && managedSubjects.length > 0
        && (
          <ManagedList
            key="evaluations_approve"
            title={I18n.t('threesixty.approve_evaluations')}
            list={managedSubjects}
          />
        )}
      <EditEvaluationModal
        show={!!editModal}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        evaluation={editModal}
        close={() => setEditModal(null)}
      />
      {evaluationHelp && (
        <Modal
          title={(
            <>
              {I18n.t('threesixty.evaluation_help_modal.title')}
            </>
        )}
          open={showHelp}
          onCancel={() => setShowHelp(false)}
          footer={null}
        >
          <SafeHTML html={evaluationHelp.content} config="adminRichText" />
        </Modal>
      )}
    </ThreesixtyCard>
  )
}

export const EvaluationList = connector(EvaluationListComponent)
