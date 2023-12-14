import _ from 'lodash'
import { useState } from 'react'
import {
  Progress, Modal, Tooltip, Typography, Row, Checkbox,
} from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import { getApprovalNominations, getNominations } from '~/modules/endUser/modules/campaigns/core/campaign/selectors'
import userPresenter from '~/presenters/user'
import { SafeHTML } from '~/components/SafeHTML'
import { CollapseItem } from '~/glint'
import { ThreesixtyCard } from '../ThreesixtyCard'
import styles from '../ListStyles.less'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connector = connect((state: any) => ({
  nominations: getNominations(state.campaigns),
  nominationsCounters: state.campaigns.campaign.nominationsCounters,
  approvalNominations: getApprovalNominations(state.campaigns),
  options: state.campaigns.campaign.options.participants,
  instructions: state.campaigns.campaign.instructions,
}), {})
const { I18n } = window
const { Title } = Typography

const NominationItem = ({ item }) => {
  const { campaignId } = item || { campaignId: 0 }
  const { id: itemId } = item || { id: 0 }
  const { isNominationCompleted } = item || { isNominationCompleted: false }
  const { user: { email } } = item ?? { user: { email: '' } }

  return (
    <>
      <Link
        to={`/threesixty_campaigns/${campaignId}/nominations/${itemId}`}
        style={{ display: 'flex', alignItems: 'center' }}
        key={email}
      >
        <Tooltip placement="topLeft" title={email}>
          <Checkbox
            checked={isNominationCompleted}
          >
            <span className={styles.subjectLabel}>{userPresenter.selfUserName(item)}</span>
          </Checkbox>
        </Tooltip>
      </Link>
    </>
  )
}

const NominationListComponent = ({
  nominations, options, percent, nominationsCounters, instructions,
}) => {
  const [showHelp, setShowHelp] = useState(false)
  const [selfNominations, notSelfNominations] = _.partition(nominations, { isSelf: true })
  const getNominationsForSetup = () => {
    if (options.subject.canNominateEvaluators && options.manager.canChooseEvaluators) {
      return nominations
    }

    if (options.subject.canNominateEvaluators) {
      return selfNominations
    }

    if (options.manager.canChooseEvaluators) {
      return notSelfNominations
    }

    return []
  }
  const nominationsForSetup = getNominationsForSetup()
  const nominationsForSetupIds = nominationsForSetup.map(({ id }) => id)

  let viewableNominations = !options.manager.canViewNominations
    || options.manager.canApproveNominations ? selfNominations : nominations

  viewableNominations = _.filter(viewableNominations,
    nomination => !_.includes(nominationsForSetupIds, nomination.id))


  const approvableNominations = options.manager.canApproveNominations ? notSelfNominations : []

  const nominationHelp = _.find(instructions, { name: 'nomination_help' })

  return (
    <ThreesixtyCard
      title={<Title level={5}>{I18n.t('threesixty.nominations')}</Title>}
      helpIcon={nominationHelp && (
        <div>
          <QuestionCircleOutlined onClick={() => setShowHelp(true)} />
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
            completed: nominationsCounters.completedNominations,
            total: nominationsCounters.totalNominations,
          })}
        </span>
      </Row>
      {nominationsForSetup.length > 0
        && (
        <CollapseItem title={I18n.t('threesixty.setup_nominations')} list={nominationsForSetup}>
          {item => <NominationItem key={item.id} item={item} />}
        </CollapseItem>
        )}
      {viewableNominations.length > 0
        && (
        <CollapseItem title={I18n.t('threesixty.view_nominations')} list={viewableNominations}>
          {item => <NominationItem key={item.id} item={item} />}
        </CollapseItem>
        )}
      {approvableNominations.length > 0
        && (
        <CollapseItem
          title={I18n.t('threesixty.approve_nominations')}
          list={approvableNominations}
        >
          {item => <NominationItem key={item.id} item={item} />}
        </CollapseItem>
        )}
      {nominationHelp && (
      <Modal
        title={(
          <>
            {I18n.t('threesixty.nomination_help_modal.title')}
          </>
        )}
        visible={showHelp}
        onCancel={() => setShowHelp(false)}
        footer={null}
      >
        <SafeHTML html={nominationHelp.content} config="adminRichText" />
      </Modal>
      )}
    </ThreesixtyCard>
  )
}
export const NominationList = connector(NominationListComponent)
