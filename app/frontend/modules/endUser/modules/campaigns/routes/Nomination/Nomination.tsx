import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import {
  Layout, Alert, Row, Col, Card, Space,
} from 'antd'
import _ from 'lodash'

import { useNavigate, useParams } from 'react-router-dom'
import { SubHeader } from '~/modules/endUser/modules/campaigns/components/SubHeader'
import {
  fetchNomination,
  removeNomination,
  addNomination,
  updateForm,
  updateStatus,
  showForm,
  hideForm,
  requestApproval,
  sendEvaluatorReminder,
  updateAllNominationStatus,
} from '~/modules/endUser/modules/campaigns/core/nomination'
import { get as getAutocomplete, searchEvaluators } from '~/modules/endUser/core/ui/autocomplete'
import {
  requirementsSelector,
  allowedRelationshipsForNewNominations,
} from '~/modules/endUser/modules/campaigns/core/nomination/selectors'
import { SafeHTML } from '~/components/SafeHTML'
import { LangDropdownWithChangeLocale } from '~/components/LangDropdown'
import { PageHeader as GlintHeader, FontsizeModifier } from '~/glint'
import { NominationForm } from './NominationForm/NominationForm'
import { NominationTable } from './NominationTable/NominationTable'
import { NameModal } from './NominationForm/NameModal'

import styles from './Nomination.less'
import { DocumentTitle } from '~/components/DocumentTitle'

const { I18n } = window

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connector = connect((state: any) => ({
  currentUser: state.currentUser,
  nomination: state.campaigns.nomination,
  instructions: state.campaigns.nomination.instructions,
  requirements: requirementsSelector(state.campaigns),
  autocomplete: getAutocomplete(state),
  allowedRelationshipsForNewNominations: allowedRelationshipsForNewNominations(state.campaigns),
}),
{
  fetchNomination,
  removeNomination,
  addNomination,
  searchEvaluators,
  updateForm,
  updateStatus,
  showForm,
  hideForm,
  requestApproval,
  sendEvaluatorReminder,
  updateAllNominationStatus,
})
const { Content } = Layout

const NominationComponent = (props) => {
  const { fetchNomination } = props
  const params = useParams()
  const navigate = useNavigate()
  useEffect(() => {
    fetchNomination(params)
  }, [])

  const [showPrompt, setShowPrompt] = useState(false)
  const [participant, setParticipant] = useState<Record<string, unknown> | null>(null)

  const {
    addNomination, instructions, nomination:
    { isSelf, options: { participants: options }, evalautionCompletedForSubject },
  } = props
  const instruction = _.find(instructions, { name: 'invite_evaluators' })
  const hasNominationPermission = isSelf
    ? options.subject.canNominateEvaluators : options.manager.canChooseEvaluators
  const canNominate = hasNominationPermission && !evalautionCompletedForSubject

  const handleAddNomination = values => addNomination({
    ...values,
  }).catch((errors) => {
    if (!errors) { return }
    const { firstName, lastName, ...rest } = errors
    if (_.isEmpty(rest) && (firstName || lastName)) {
      setParticipant({ ...values })
      setShowPrompt(true)
    }
  })

  const handleAdd = (values) => {
    addNomination({
      ...participant, ...values,
    }).then(() => {
      setShowPrompt(false)
    }).catch(() => {
      setShowPrompt(false)
    })
  }

  const { nomination: { loaded } } = props
  if (!loaded) { return null }

  return (
    <>
      <DocumentTitle text={I18n.t('threesixty.nomination')} />
      <GlintHeader>
        <Col flex="auto" span={24} className="ta-e">
          <Space>
            <FontsizeModifier />
            <LangDropdownWithChangeLocale />
          </Space>
        </Col>
      </GlintHeader>
      <Content className={styles.pageContent}>
        <SubHeader
          title={I18n.t('threesixty.nomination')}
          onBack={() => navigate(`/threesixty_campaigns/${params.campaignId}`)}
          backButtonAriaLabel={I18n.t('frontend.aria.back_to_tasks')}
        />
        <Row justify="center">
          <Col xs={24} lg={22} xl={20} xxl={14}>
            {hasNominationPermission && evalautionCompletedForSubject && (
              <Alert
                message={I18n.t('threesixty.evaluation_closed_nomination_message')}
                className="mbm"
                type="info"
                showIcon
              />
            )}
            {instruction && (
              <Card className="mt-8">
                <SafeHTML html={instruction.content} />
              </Card>
            )}
            {canNominate && (
              <NominationForm
                {...props}
                handleAddNomination={handleAddNomination}
                setShowPrompt={setShowPrompt}
              />
            )}
            <NominationTable
              {...props}
              handleAddNomination={handleAddNomination}
              canNominate={canNominate}
              setShowPrompt={setShowPrompt}
              setParticipant={setParticipant}
            />
            <NameModal
              participant={participant}
              showPrompt={showPrompt}
              setShowPrompt={setShowPrompt}
              handleAdd={handleAdd}
            />
          </Col>
        </Row>
      </Content>
    </>
  )
}

export const Nomination = connector(NominationComponent)
